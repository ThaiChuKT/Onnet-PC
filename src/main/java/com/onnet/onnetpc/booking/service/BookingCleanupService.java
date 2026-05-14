package com.onnet.onnetpc.booking.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.onnet.onnetpc.booking.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BookingCleanupService {

    private static final Logger log = LoggerFactory.getLogger(BookingCleanupService.class);

    private final BookingRepository bookingRepository;
    private final long pendingTimeoutMinutes;

    public BookingCleanupService(BookingRepository bookingRepository,
                                 @Value("${app.booking.pending-timeout-minutes:15}") long pendingTimeoutMinutes) {
        this.bookingRepository = bookingRepository;
        this.pendingTimeoutMinutes = pendingTimeoutMinutes;
    }

    // run every 3 minutes by default
    @Scheduled(fixedDelayString = "${app.booking.cleanup-interval-ms:180000}")
    @Transactional
    public void removeTimedOutPendingBookings() {
        try {
            Instant cutoff = Instant.now().minus(pendingTimeoutMinutes, ChronoUnit.MINUTES);
            List<Long> ids = bookingRepository.findTimedOutPendingBookingIds(cutoff);
            if (ids == null || ids.isEmpty()) {
                return;
            }
            log.info("Cleaning up {} timed-out pending bookings before {}", ids.size(), cutoff);
            bookingRepository.deleteAllByIdInBatch(ids);
        } catch (Exception ex) {
            log.error("Error while cleaning up pending bookings", ex);
        }
    }
}
