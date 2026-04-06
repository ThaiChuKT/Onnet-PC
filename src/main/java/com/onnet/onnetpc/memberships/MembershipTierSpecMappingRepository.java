package com.onnet.onnetpc.memberships;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MembershipTierSpecMappingRepository extends JpaRepository<MembershipTierSpecMapping, Long> {

    @Query(
        value = """
            SELECT m.tier_id
            FROM membership_tier_spec_mappings m
            WHERE m.spec_id = :specId
            LIMIT 1
            """,
        nativeQuery = true
    )
    Optional<Long> findTierIdBySpecId(@Param("specId") Long specId);

    @Query(
        value = """
            SELECT DISTINCT m.spec_id
            FROM membership_tier_spec_mappings m
            JOIN membership_tiers t ON t.id = m.tier_id
            JOIN membership_tiers requested_tier ON requested_tier.id = :requestedTierId
            WHERE t.tier_level <= requested_tier.tier_level
            """,
        nativeQuery = true
    )
    List<Long> findAccessibleSpecIdsForRequestedTier(@Param("requestedTierId") Long requestedTierId);

    @Query(
        value = """
            SELECT m.spec_id
            FROM membership_tier_spec_mappings m
            JOIN pc_specs s ON s.id = m.spec_id
            WHERE m.tier_id = :tierId
            ORDER BY s.price_per_hour ASC, s.id ASC
            LIMIT 1
            """,
        nativeQuery = true
    )
    Optional<Long> findPrimarySpecIdByTierId(@Param("tierId") Long tierId);
}
