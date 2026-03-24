package com.onnet.onnetpc.booking.repository;

import com.onnet.onnetpc.booking.entity.Booking;
import com.onnet.onnetpc.booking.enums.BookingStatus;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

        @Query(
                value = """
                        SELECT *
                        FROM bookings
                        WHERE id = :bookingId
                            AND user_id = :userId
                        FOR UPDATE
                        """,
                nativeQuery = true
        )
        Optional<Booking> findByIdAndUserIdForUpdate(@Param("bookingId") Long bookingId, @Param("userId") Long userId);

        @Query(
                value = """
                        SELECT *
                        FROM bookings
                        WHERE id = :bookingId
                            AND status = :status
                        FOR UPDATE
                        """,
                nativeQuery = true
        )
        Optional<Booking> findByIdAndStatusForUpdate(@Param("bookingId") Long bookingId, @Param("status") String status);

        @Query("""
                select b.id
                from Booking b
                where b.status = com.onnet.onnetpc.booking.enums.BookingStatus.pending
                    and b.createdAt < :cutoff
                order by b.id asc
        """)
        List<Long> findTimedOutPendingBookingIds(@Param("cutoff") Instant cutoff);
}
