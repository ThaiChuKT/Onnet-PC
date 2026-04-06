package com.onnet.onnetpc.session.service;

import com.onnet.onnetpc.booking.entity.Booking;
import com.onnet.onnetpc.booking.enums.BookingStatus;
import com.onnet.onnetpc.booking.enums.BookingType;
import com.onnet.onnetpc.booking.repository.BookingRepository;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.memberships.MembershipTier;
import com.onnet.onnetpc.memberships.MembershipTierRepository;
import com.onnet.onnetpc.memberships.MembershipTierSpecMappingRepository;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.session.Session;
import com.onnet.onnetpc.session.SessionQueue;
import com.onnet.onnetpc.session.SessionQueueRepository;
import com.onnet.onnetpc.session.SessionRepository;
import com.onnet.onnetpc.session.dto.ActiveSessionResponse;
import com.onnet.onnetpc.session.dto.EndSessionResponse;
import com.onnet.onnetpc.session.dto.StartSessionResponse;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionLifecycleService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PcRepository pcRepository;
    private final SessionRepository sessionRepository;
    private final SessionQueueRepository sessionQueueRepository;
    private final MembershipTierSpecMappingRepository tierSpecMappingRepository;
    private final MembershipTierRepository membershipTierRepository;

    public SessionLifecycleService(
        UserRepository userRepository,
        BookingRepository bookingRepository,
        PcRepository pcRepository,
        SessionRepository sessionRepository,
        SessionQueueRepository sessionQueueRepository,
        MembershipTierSpecMappingRepository tierSpecMappingRepository,
        MembershipTierRepository membershipTierRepository
    ) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.pcRepository = pcRepository;
        this.sessionRepository = sessionRepository;
        this.sessionQueueRepository = sessionQueueRepository;
        this.tierSpecMappingRepository = tierSpecMappingRepository;
        this.membershipTierRepository = membershipTierRepository;
    }

    @Transactional
    public StartSessionResponse startSession(String email, Long bookingId) {
        // Ensure overdue active sessions are closed so stale machines can be reused.
        expireOverdueActiveSessions();

        User user = findUserByEmail(email);
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(bookingId, user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.paid) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PAID booking can start session");
        }

        Instant now = Instant.now();
        if (booking.getStartTime() != null && now.isBefore(booking.getStartTime())) {
            long secondsUntilStart = Duration.between(now, booking.getStartTime()).toSeconds();
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Too early to start. Countdown seconds: " + Math.max(secondsUntilStart, 0)
            );
        }

        if (booking.getEndTime() != null && !now.isBefore(booking.getEndTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking time window has ended");
        }

        Session existing = sessionRepository.findByBookingIdAndStatusIgnoreCase(booking.getId(), "active").orElse(null);
        if (existing != null) {
            return toStartResponse(existing, "Session is already active");
        }

        Pc pc = resolvePcForSessionStart(booking);
        if (pc == null) {
            int queuePosition = enqueueForTierWaiting(booking, user);
            throw new ApiException(
                HttpStatus.CONFLICT,
                "No available machine right now. Added to queue at position #" + queuePosition
            );
        }
        if (pc.getStatus() == PcStatus.maintenance) {
            throw new ApiException(HttpStatus.CONFLICT, "Machine is under maintenance");
        }

        pc.setStatus(PcStatus.in_use);
        pc.setUpdatedAt(now);
        pc.setLastUsedAt(now);
        pcRepository.save(pc);

        booking.setPc(pc);
        booking.setUpdatedAt(now);
        bookingRepository.save(booking);

        SessionQueue waitingQueue = sessionQueueRepository
            .findByBookingIdAndStatusIgnoreCase(booking.getId(), "waiting")
            .orElse(null);
        if (waitingQueue != null) {
            waitingQueue.setStatus("assigned");
            sessionQueueRepository.save(waitingQueue);
        }

        Session session = new Session();
        session.setBooking(booking);
        session.setUser(user);
        session.setPc(pc);
        session.setStartTime(now);
        session.setEndTime(booking.getEndTime());
        session.setTotalCost(booking.getTotalPrice());
        session.setStatus("active");
        Session saved = sessionRepository.save(session);

        return toStartResponse(saved, "Session started successfully");
    }

    @Transactional(readOnly = true)
    public ActiveSessionResponse getCurrentSession(String email) {
        User user = findUserByEmail(email);
        Session activeSession = findCurrentActiveSession(user.getId());

        Instant now = Instant.now();
        long remainingSeconds = calculateRemainingSeconds(activeSession.getEndTime(), now);
        boolean warning15 = activeSession.getEndTime() != null && remainingSeconds > 0 && remainingSeconds <= 900;

        return new ActiveSessionResponse(
            activeSession.getId(),
            activeSession.getBooking().getId(),
            activeSession.getPc().getId(),
            activeSession.getPc().getLocation(),
            activeSession.getStartTime(),
            activeSession.getEndTime(),
            remainingSeconds,
            warning15,
            activeSession.getStatus(),
            warning15 ? "Session will expire in 15 minutes" : "Session is active"
        );
    }

    @Transactional
    public EndSessionResponse endCurrentSession(String email) {
        User user = findUserByEmail(email);
        Session current = findCurrentActiveSession(user.getId());

        Session session = sessionRepository.findByIdAndUserIdForUpdate(current.getId(), user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!"active".equalsIgnoreCase(session.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only ACTIVE session can be ended");
        }

        Instant now = Instant.now();
        session.setEndTime(now);
        session.setStatus("ended");
        sessionRepository.save(session);

        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(session.getBooking().getId(), user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        boolean hasRemainingTime = booking.getEndTime() != null && now.isBefore(booking.getEndTime());
        booking.setStatus(hasRemainingTime ? BookingStatus.paid : BookingStatus.completed);
        booking.setUpdatedAt(now);
        bookingRepository.save(booking);

        Pc pc = pcRepository.findByIdForUpdate(session.getPc().getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));
        if (pc.getStatus() != PcStatus.maintenance) {
            pc.setStatus(PcStatus.available);
        }
        pc.setUpdatedAt(now);
        pcRepository.save(pc);
        promoteQueuedBookingForSpec(pc.getSpec().getId());

        return new EndSessionResponse(
            session.getId(),
            booking.getId(),
            now,
            true,
            session.getStatus(),
            hasRemainingTime
                ? "Session stopped. You can start again until booking time ends."
                : "Session ended. Booking time is fully used."
        );
    }

    private Session findCurrentActiveSession(Long userId) {
        List<Session> sessions = sessionRepository.findActiveByUserId(userId);
        if (sessions.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No active session found");
        }
        return sessions.get(0);
    }

    private void expireOverdueActiveSessions() {
        Instant now = Instant.now();
        List<Long> expiredSessionIds = sessionRepository.findExpiredActiveSessionIds(now);
        for (Long sessionId : expiredSessionIds) {
            Session expired = sessionRepository.findByIdAndStatusForUpdate(sessionId, "active").orElse(null);
            if (expired == null) {
                continue;
            }

            expired.setStatus("expired");
            sessionRepository.save(expired);

            Booking booking = bookingRepository.findByIdAndStatusForUpdate(
                expired.getBooking().getId(),
                BookingStatus.paid.name()
            ).orElse(null);
            if (booking != null) {
                booking.setStatus(BookingStatus.completed);
                booking.setUpdatedAt(now);
                bookingRepository.save(booking);
            }

            Pc pc = pcRepository.findByIdForUpdate(expired.getPc().getId()).orElse(null);
            if (pc == null) {
                continue;
            }

            if (pc.getStatus() != PcStatus.maintenance) {
                pc.setStatus(PcStatus.available);
            }
            pc.setUpdatedAt(now);
            pcRepository.save(pc);
            promoteQueuedBookingForSpec(pc.getSpec().getId());
        }
    }

    private Pc resolvePcForSessionStart(Booking booking) {
        if (booking.getPc() != null) {
            Pc lockedAssignedPc = pcRepository.findByIdForUpdate(booking.getPc().getId()).orElse(null);
            if (lockedAssignedPc != null
                && lockedAssignedPc.getStatus() != PcStatus.maintenance
                && (lockedAssignedPc.getStatus() == PcStatus.available || isStaleReserved(lockedAssignedPc))) {
                return lockedAssignedPc;
            }
            booking.setPc(null);
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);
        }

        if (booking.getBookingType() == BookingType.subscription) {
            Long tierId = resolveTierIdByBookingSpec(booking);
            if (tierId != null) {
                List<Long> specIds = tierSpecMappingRepository.findAccessibleSpecIdsForRequestedTier(tierId);
                if (!specIds.isEmpty()) {
                    Pc availablePc = pcRepository.findNextAvailableBySpecIdsForUpdate(specIds).orElse(null);
                    if (availablePc != null) {
                        return availablePc;
                    }
                    Pc stalePc = pcRepository.findNextStaleReservedBySpecIdsForUpdate(specIds).orElse(null);
                    if (stalePc != null) {
                        return stalePc;
                    }
                }
            }
        }

        Pc availablePc = pcRepository.findNextAvailableBySpecIdForUpdate(booking.getSpec().getId()).orElse(null);
        if (availablePc == null) {
            // Backward compatibility for databases where deleted_at was auto-populated unexpectedly.
            availablePc = pcRepository.findNextAvailableBySpecIdAnyDeletedForUpdate(booking.getSpec().getId()).orElse(null);
        }
        if (availablePc != null) {
            return availablePc;
        }

        Pc staleReserved = pcRepository.findNextStaleReservedBySpecIdForUpdate(booking.getSpec().getId()).orElse(null);
        if (staleReserved == null) {
            staleReserved = pcRepository.findNextStaleReservedBySpecIdAnyDeletedForUpdate(booking.getSpec().getId()).orElse(null);
        }

        if (staleReserved != null) {
            return staleReserved;
        }

        return null;
    }

    private boolean isStaleReserved(Pc pc) {
        return pc.getStatus() == PcStatus.in_use
            && sessionRepository.findActiveSessionIdsByPcId(pc.getId()).isEmpty();
    }

    private Long resolveTierIdByBookingSpec(Booking booking) {
        if (booking.getSpec() == null || booking.getSpec().getId() == null) {
            return null;
        }
        return tierSpecMappingRepository.findTierIdBySpecId(booking.getSpec().getId()).orElse(null);
    }

    private int enqueueForTierWaiting(Booking booking, User user) {
        SessionQueue existingWaiting = sessionQueueRepository
            .findByBookingIdAndStatusIgnoreCase(booking.getId(), "waiting")
            .orElse(null);
        if (existingWaiting != null) {
            return existingWaiting.getQueuePosition() == null ? 1 : existingWaiting.getQueuePosition();
        }

        Long tierId = resolveTierIdByBookingSpec(booking);
        if (tierId == null) {
            throw new ApiException(HttpStatus.CONFLICT, "No available machine in selected package pool");
        }

        Integer maxPosition = sessionQueueRepository.findMaxWaitingPositionForUpdate(tierId);
        int queuePosition = (maxPosition == null ? 0 : maxPosition) + 1;

        MembershipTier tier = membershipTierRepository.findById(tierId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membership tier not found"));

        SessionQueue queue = new SessionQueue();
        queue.setBooking(booking);
        queue.setUser(user);
        queue.setSpec(booking.getSpec());
        queue.setTier(tier);
        queue.setQueuePosition(queuePosition);
        queue.setStatus("waiting");
        sessionQueueRepository.save(queue);

        return queuePosition;
    }

    private void promoteQueuedBookingForSpec(Long specId) {
        if (specId == null) {
            return;
        }

        SessionQueue queued = sessionQueueRepository.findNextWaitingEligibleForSpecForUpdate(specId).orElse(null);
        if (queued == null || queued.getBooking() == null) {
            return;
        }

        Booking queuedBooking = bookingRepository.findByIdAndStatusForUpdate(
            queued.getBooking().getId(),
            BookingStatus.paid.name()
        ).orElse(null);
        if (queuedBooking == null) {
            queued.setStatus("skipped");
            sessionQueueRepository.save(queued);
            return;
        }

        List<Long> candidateSpecIds = new ArrayList<>();
        if (queued.getTier() != null && queued.getTier().getId() != null) {
            candidateSpecIds.addAll(tierSpecMappingRepository.findAccessibleSpecIdsForRequestedTier(queued.getTier().getId()));
        }
        if (candidateSpecIds.isEmpty() && queuedBooking.getSpec() != null && queuedBooking.getSpec().getId() != null) {
            candidateSpecIds.add(queuedBooking.getSpec().getId());
        }

        Pc available = candidateSpecIds.isEmpty()
            ? null
            : pcRepository.findNextAvailableBySpecIdsForUpdate(candidateSpecIds).orElse(null);
        if (available == null && !candidateSpecIds.isEmpty()) {
            available = pcRepository.findNextStaleReservedBySpecIdsForUpdate(candidateSpecIds).orElse(null);
        }
        if (available == null) {
            return;
        }

        if (available.getStatus() == PcStatus.maintenance) {
            return;
        }

        available.setStatus(PcStatus.in_use);
        available.setUpdatedAt(Instant.now());
        pcRepository.save(available);

        queuedBooking.setPc(available);
        queuedBooking.setUpdatedAt(Instant.now());
        bookingRepository.save(queuedBooking);

        queued.setStatus("assigned");
        sessionQueueRepository.save(queued);

        normalizeWaitingPositions(queued.getTier());
    }

    private void normalizeWaitingPositions(MembershipTier tier) {
        if (tier == null || tier.getId() == null) {
            return;
        }

        List<SessionQueue> waitingRows = sessionQueueRepository.findAll().stream()
            .filter(item -> "waiting".equalsIgnoreCase(item.getStatus()))
            .filter(item -> item.getTier() != null && tier.getId().equals(item.getTier().getId()))
            .sorted((a, b) -> Integer.compare(
                a.getQueuePosition() == null ? Integer.MAX_VALUE : a.getQueuePosition(),
                b.getQueuePosition() == null ? Integer.MAX_VALUE : b.getQueuePosition()
            ))
            .toList();

        int position = 1;
        for (SessionQueue row : waitingRows) {
            if (row.getQueuePosition() == null || row.getQueuePosition() != position) {
                row.setQueuePosition(position);
                sessionQueueRepository.save(row);
            }
            position++;
        }
    }

    private StartSessionResponse toStartResponse(Session session, String message) {
        Instant now = Instant.now();
        long remainingSeconds = calculateRemainingSeconds(session.getEndTime(), now);
        String connectionInfo = "Use machine #" + session.getPc().getId() + " at " + session.getPc().getLocation();

        return new StartSessionResponse(
            session.getId(),
            session.getBooking().getId(),
            session.getPc().getId(),
            session.getPc().getLocation(),
            session.getStartTime(),
            session.getEndTime(),
            remainingSeconds,
            connectionInfo,
            session.getStatus(),
            message
        );
    }

    private long calculateRemainingSeconds(Instant endTime, Instant now) {
        if (endTime == null) {
            return 0L;
        }
        return Math.max(Duration.between(now, endTime).toSeconds(), 0L);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
