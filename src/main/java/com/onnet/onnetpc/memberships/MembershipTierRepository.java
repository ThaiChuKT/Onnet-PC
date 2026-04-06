package com.onnet.onnetpc.memberships;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipTierRepository extends JpaRepository<MembershipTier, Long> {

    Optional<MembershipTier> findByTierNameIgnoreCaseAndActiveTrue(String tierName);
}
