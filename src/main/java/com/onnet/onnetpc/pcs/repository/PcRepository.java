package com.onnet.onnetpc.pcs.repository;

import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcStatus;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PcRepository extends JpaRepository<Pc, Long> {

    Page<Pc> findByStatus(PcStatus status, Pageable pageable);

    @Query("""
        select pc
        from Pc pc
        where pc.status = com.onnet.onnetpc.pcs.PcStatus.available
          and (:keyword is null or lower(pc.spec.specName) like lower(concat('%', :keyword, '%')) or lower(coalesce(pc.spec.description, '')) like lower(concat('%', :keyword, '%')))
          and (:cpu is null or lower(coalesce(pc.spec.cpu, '')) like lower(concat('%', :cpu, '%')))
          and (:gpu is null or lower(coalesce(pc.spec.gpu, '')) like lower(concat('%', :gpu, '%')))
          and (:ramMin is null or pc.spec.ram >= :ramMin)
          and (:storageMin is null or pc.spec.storage >= :storageMin)
          and (:priceMin is null or pc.spec.pricePerHour >= :priceMin)
          and (:priceMax is null or pc.spec.pricePerHour <= :priceMax)
          and (:purpose is null or lower(coalesce(pc.spec.description, '')) like lower(concat('%', :purpose, '%')))
    """)
    Page<Pc> searchAvailable(
        @Param("keyword") String keyword,
        @Param("cpu") String cpu,
        @Param("gpu") String gpu,
        @Param("ramMin") Integer ramMin,
        @Param("storageMin") Integer storageMin,
        @Param("priceMin") BigDecimal priceMin,
        @Param("priceMax") BigDecimal priceMax,
        @Param("purpose") String purpose,
        Pageable pageable
    );

    Page<Pc> findByDeletedAtIsNull(Pageable pageable);

    Page<Pc> findByDeletedAtIsNullAndStatus(PcStatus status, Pageable pageable);

    @Query(
        value = """
            SELECT *
            FROM pcs
            WHERE spec_id = :specId
                            AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')
                            AND LOWER(status) = 'available'
                        ORDER BY COALESCE(last_used_at, '1970-01-01 00:00:00') ASC, id ASC
            LIMIT 1
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<Pc> findNextAvailableBySpecIdForUpdate(@Param("specId") Long specId);

    @Query(
        value = """
            SELECT p.*
            FROM pcs p
            WHERE p.spec_id = :specId
                            AND (p.deleted_at IS NULL OR p.deleted_at = '0000-00-00 00:00:00')
                            AND LOWER(p.status) = 'in_use'
              AND NOT EXISTS (
                  SELECT 1
                  FROM sessions s
                  WHERE s.pc_id = p.id
                    AND LOWER(s.status) = 'active'
              )
            ORDER BY COALESCE(p.last_used_at, '1970-01-01 00:00:00') ASC, p.id ASC
            LIMIT 1
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<Pc> findNextStaleReservedBySpecIdForUpdate(@Param("specId") Long specId);

    @Query(
        value = """
            SELECT *
            FROM pcs
            WHERE id = :pcId
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<Pc> findByIdForUpdate(@Param("pcId") Long pcId);
}
