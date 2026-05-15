package com.onnet.onnetpc.session;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionQueueRepository extends JpaRepository<SessionQueue, Long> {

    @Query(
        value = """
            SELECT COALESCE(MAX(queue_position), 0)
            FROM session_queue
            WHERE spec_id = :specId
              AND status = 'waiting'
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Integer findMaxWaitingPositionForUpdate(@Param("specId") Long specId);

    Optional<SessionQueue> findByBookingIdAndStatusIgnoreCase(Long bookingId, String status);

    @Query(
        value = """
            SELECT sq.*
            FROM session_queue sq
            WHERE LOWER(sq.status) = 'waiting'
              AND sq.spec_id = :specId
            ORDER BY sq.queue_position ASC, sq.id ASC
            LIMIT 1
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<SessionQueue> findNextWaitingEligibleForSpecForUpdate(@Param("specId") Long specId);
}
