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
            WHERE tier_id = :tierId
              AND status = 'waiting'
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Integer findMaxWaitingPositionForUpdate(@Param("tierId") Long tierId);

    Optional<SessionQueue> findByBookingIdAndStatusIgnoreCase(Long bookingId, String status);

    @Query(
        value = """
            SELECT sq.*
            FROM session_queue sq
            JOIN membership_tiers requester_tier ON requester_tier.id = sq.tier_id
            JOIN membership_tier_spec_mappings spec_map ON spec_map.spec_id = :specId
            JOIN membership_tiers spec_tier ON spec_tier.id = spec_map.tier_id
            WHERE LOWER(sq.status) = 'waiting'
              AND requester_tier.tier_level >= spec_tier.tier_level
            ORDER BY requester_tier.queue_priority ASC, sq.queue_position ASC, sq.id ASC
            LIMIT 1
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<SessionQueue> findNextWaitingEligibleForSpecForUpdate(@Param("specId") Long specId);
}
