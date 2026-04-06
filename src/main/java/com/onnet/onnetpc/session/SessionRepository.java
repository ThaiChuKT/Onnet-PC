package com.onnet.onnetpc.session;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionRepository extends JpaRepository<Session, Long> {

		Optional<Session> findByBookingIdAndStatusIgnoreCase(Long bookingId, String status);

		@Query("""
				select s
				from Session s
				where s.user.id = :userId
					and lower(s.status) = 'active'
				order by s.startTime desc
		""")
		List<Session> findActiveByUserId(@Param("userId") Long userId);

		@Query("""
				select s.id
				from Session s
				where s.pc.id = :pcId
					and lower(s.status) = 'active'
		""")
		List<Long> findActiveSessionIdsByPcId(@Param("pcId") Long pcId);

		@Query(
				value = """
						SELECT *
						FROM sessions
						WHERE id = :sessionId
						  AND user_id = :userId
						FOR UPDATE
						""",
				nativeQuery = true
		)
		Optional<Session> findByIdAndUserIdForUpdate(@Param("sessionId") Long sessionId, @Param("userId") Long userId);

		@Query(
				value = """
						SELECT *
						FROM sessions
						WHERE id = :sessionId
						  AND LOWER(status) = :status
						FOR UPDATE
						""",
				nativeQuery = true
		)
		Optional<Session> findByIdAndStatusForUpdate(@Param("sessionId") Long sessionId, @Param("status") String status);

		@Query("""
				select s.id
				from Session s
				where lower(s.status) = 'active'
					and s.endTime is not null
					and s.endTime < :now
				order by s.id asc
		""")
		List<Long> findExpiredActiveSessionIds(@Param("now") Instant now);
}
