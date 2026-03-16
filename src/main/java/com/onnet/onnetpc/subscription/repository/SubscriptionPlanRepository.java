package com.onnet.onnetpc.subscription.repository;

import com.onnet.onnetpc.subscription.SubscriptionPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    List<SubscriptionPlan> findBySpecIdAndActiveTrueOrderByDurationDaysAsc(Long specId);
}
