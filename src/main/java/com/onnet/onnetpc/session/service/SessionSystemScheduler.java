package com.onnet.onnetpc.session.service;

import com.onnet.onnetpc.booking.repository.BookingRepository;
import com.onnet.onnetpc.session.SessionRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SessionSystemScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionSystemScheduler.class);

    private final SessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final SessionSystemJobService sessionSystemJobService;

    @Value("${app.booking.pending-timeout-minutes:15}")
    private long pendingTimeoutMinutes;

    public SessionSystemScheduler(
        SessionRepository sessionRepository,
        BookingRepository bookingRepository,
        SessionSystemJobService sessionSystemJobService
    ) {
        this.sessionRepository = sessionRepository;
        this.bookingRepository = bookingRepository;
        this.sessionSystemJobService = sessionSystemJobService;
    }

    @Scheduled(fixedDelayString = "${app.jobs.session-expire-fixed-delay-ms:60000}")
    public void expireOverdueSessions() {
        Instant now = Instant.now();
        List<Long> ids = sessionRepository.findExpiredActiveSessionIds(now);
        List<Long> processedIds = new ArrayList<>();

        for (Long sessionId : ids) {
            boolean processed = sessionSystemJobService.expireSessionById(sessionId);
            if (processed) {
                processedIds.add(sessionId);
                LOGGER.info("S1 notification: session {} has expired", sessionId);
            }
        }

        LOGGER.info(
            "S1 job completed at {}. processed={}, sessionIds={}",
            now,
            processedIds.size(),
            processedIds
        );
    }

    @Scheduled(fixedDelayString = "${app.jobs.pending-cancel-fixed-delay-ms:300000}")
    public void cancelTimedOutPendingBookings() {
        Instant now = Instant.now();
        Instant cutoff = now.minusSeconds(pendingTimeoutMinutes * 60);
        List<Long> ids = bookingRepository.findTimedOutPendingBookingIds(cutoff);
        List<Long> processedIds = new ArrayList<>();

        for (Long bookingId : ids) {
            boolean processed = sessionSystemJobService.cancelPendingBookingById(bookingId);
            if (processed) {
                processedIds.add(bookingId);
                LOGGER.info("S2 notification: booking {} cancelled due to payment timeout", bookingId);
            }
        }

        LOGGER.info(
            "S2 job completed at {}. processed={}, bookingIds={}, timeoutMinutes={}",
            now,
            processedIds.size(),
            processedIds,
            pendingTimeoutMinutes
        );
    }
}
