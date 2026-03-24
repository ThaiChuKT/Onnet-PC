package com.onnet.onnetpc.session;

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
}
