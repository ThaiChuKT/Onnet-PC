package com.onnet.onnetpc.booking.repository;

import com.onnet.onnetpc.booking.entity.Booking;
import com.onnet.onnetpc.booking.enums.BookingStatus;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
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

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
