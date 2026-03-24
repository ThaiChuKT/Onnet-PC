package com.onnet.onnetpc.session.service;

import com.onnet.onnetpc.booking.entity.Booking;
import com.onnet.onnetpc.booking.enums.BookingStatus;
import com.onnet.onnetpc.booking.repository.BookingRepository;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.session.Session;
import com.onnet.onnetpc.session.SessionRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionSystemJobService {

    private final SessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final PcRepository pcRepository;

    public SessionSystemJobService(
        SessionRepository sessionRepository,
        BookingRepository bookingRepository,
        PcRepository pcRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.bookingRepository = bookingRepository;
        this.pcRepository = pcRepository;
    }

    @Transactional
    public boolean expireSessionById(Long sessionId) {
        Optional<Session> optionalSession = sessionRepository.findByIdAndStatusForUpdate(sessionId, "active");
        if (optionalSession.isEmpty()) {
            return false;
        }

        Session session = optionalSession.get();
        Instant now = Instant.now();
        session.setStatus("expired");
        sessionRepository.save(session);

        Optional<Booking> paidBooking = bookingRepository.findByIdAndStatusForUpdate(
            session.getBooking().getId(),
            BookingStatus.paid.name()
        );
        if (paidBooking.isPresent()) {
            Booking booking = paidBooking.get();
            booking.setStatus(BookingStatus.completed);
            booking.setUpdatedAt(now);
            bookingRepository.save(booking);
        }

        Optional<Pc> optionalPc = pcRepository.findByIdForUpdate(session.getPc().getId());
        if (optionalPc.isPresent()) {
            Pc pc = optionalPc.get();
            if (pc.getStatus() != PcStatus.maintenance) {
                pc.setStatus(PcStatus.available);
            }
            pc.setUpdatedAt(now);
            pcRepository.save(pc);
        }

        return true;
    }

    @Transactional
    public boolean cancelPendingBookingById(Long bookingId) {
        Optional<Booking> optionalBooking = bookingRepository.findByIdAndStatusForUpdate(
            bookingId,
            BookingStatus.pending.name()
        );
        if (optionalBooking.isEmpty()) {
            return false;
        }

        Booking booking = optionalBooking.get();
        booking.setStatus(BookingStatus.cancelled);
        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);
        return true;
    }
}
