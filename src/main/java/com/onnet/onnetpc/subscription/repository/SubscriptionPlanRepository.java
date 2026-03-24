package com.onnet.onnetpc.subscription.repository;

import com.onnet.onnetpc.subscription.SubscriptionPlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    List<SubscriptionPlan> findBySpecIdAndActiveTrueOrderByDurationDaysAsc(Long specId);

    Optional<SubscriptionPlan> findByIdAndActiveTrue(Long id);
}
