package com.onnet.onnetpc.booking.repository;

import com.onnet.onnetpc.booking.Booking;
import com.onnet.onnetpc.booking.BookingStatus;
import java.time.Instant;
import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByPcIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
        Long pcId,
        Collection<BookingStatus> statuses,
        Instant endTime,
        Instant startTime
    );

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    java.util.Optional<Booking> findByIdAndUserId(Long id, Long userId);
}
