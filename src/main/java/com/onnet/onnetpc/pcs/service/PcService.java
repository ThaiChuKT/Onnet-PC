package com.onnet.onnetpc.pcs.service;

import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.memberships.MembershipTier;
import com.onnet.onnetpc.memberships.MembershipTierRepository;
import com.onnet.onnetpc.memberships.MembershipTierSpecMapping;
import com.onnet.onnetpc.memberships.MembershipTierSpecMappingRepository;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcSpec;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.Review;
import com.onnet.onnetpc.pcs.ReviewStatus;
import com.onnet.onnetpc.pcs.dto.MachineDetailResponse;
import com.onnet.onnetpc.pcs.dto.MachineListItemResponse;
import com.onnet.onnetpc.pcs.dto.ReviewSummaryResponse;
import com.onnet.onnetpc.pcs.dto.SubscriptionPlanPriceResponse;
import com.onnet.onnetpc.pcs.dto.TierSpecPlanCatalogResponse;
import com.onnet.onnetpc.pcs.dto.TierSpecPlanPlanResponse;
import com.onnet.onnetpc.pcs.dto.TierSpecPlanSpecResponse;
import com.onnet.onnetpc.pcs.dto.TierSpecPlanTierResponse;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.pcs.repository.PcSpecRepository;
import com.onnet.onnetpc.pcs.repository.ReviewRepository;
import com.onnet.onnetpc.subscription.SubscriptionPlan;
import com.onnet.onnetpc.subscription.repository.SubscriptionPlanRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PcService {

    private final PcRepository pcRepository;
    private final PcSpecRepository pcSpecRepository;
    private final ReviewRepository reviewRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final MembershipTierSpecMappingRepository membershipTierSpecMappingRepository;

    public PcService(
        PcRepository pcRepository,
        PcSpecRepository pcSpecRepository,
        ReviewRepository reviewRepository,
        SubscriptionPlanRepository subscriptionPlanRepository,
        MembershipTierRepository membershipTierRepository,
        MembershipTierSpecMappingRepository membershipTierSpecMappingRepository
    ) {
        this.pcRepository = pcRepository;
        this.pcSpecRepository = pcSpecRepository;
        this.reviewRepository = reviewRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.membershipTierRepository = membershipTierRepository;
        this.membershipTierSpecMappingRepository = membershipTierSpecMappingRepository;
    }

    @Transactional(readOnly = true)
    public Page<MachineListItemResponse> listAvailable(
        int page,
        int size,
        String sort,
        String keyword,
        String cpu,
        String gpu,
        Integer ramMin,
        Integer storageMin,
        BigDecimal priceMin,
        BigDecimal priceMax,
        String purpose
    ) {
        Sort sortBy;
        if ("price_desc".equalsIgnoreCase(sort)) {
            sortBy = Sort.by(Sort.Direction.DESC, "spec.pricePerHour");
        } else if ("newest".equalsIgnoreCase(sort)) {
            sortBy = Sort.by(Sort.Direction.DESC, "id");
        } else {
            sortBy = Sort.by(Sort.Direction.ASC, "spec.pricePerHour");
        }

        Pageable pageable = PageRequest.of(page, size, sortBy);
        return pcRepository.searchAvailable(
                normalizeText(keyword),
                normalizeText(cpu),
                normalizeText(gpu),
                ramMin,
                storageMin,
                priceMin,
                priceMax,
                normalizeText(purpose),
                pageable
            )
            .map(pc -> new MachineListItemResponse(
                pc.getId(),
                pc.getSpec().getId(),
                pc.getSpec().getSpecName(),
                pc.getSpec().getCpu(),
                pc.getSpec().getGpu(),
                pc.getSpec().getRam(),
                pc.getSpec().getStorage(),
                pc.getSpec().getPricePerHour(),
                pc.getLocation(),
                pc.getStatus() == null ? null : pc.getStatus().name()
            ));
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    @Transactional(readOnly = true)
    public MachineDetailResponse getMachineDetail(Long pcId) {
        Pc pc = pcRepository.findById(pcId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));

        List<SubscriptionPlanPriceResponse> plans = subscriptionPlanRepository
            .findBySpecIdAndActiveTrueOrderByDurationDaysAsc(pc.getSpec().getId())
            .stream()
            .map(this::toPlanResponse)
            .toList();

        List<ReviewSummaryResponse> reviews = reviewRepository
            .findTop20ByPcIdAndStatusOrderByCreatedAtDesc(pc.getId(), ReviewStatus.approved)
            .stream()
            .map(this::toReviewResponse)
            .toList();

        return new MachineDetailResponse(
            pc.getId(),
            pc.getSpec().getId(),
            pc.getSpec().getSpecName(),
            pc.getSpec().getCpu(),
            pc.getSpec().getGpu(),
            pc.getSpec().getRam(),
            pc.getSpec().getStorage(),
            pc.getSpec().getOs(),
            pc.getSpec().getDescription(),
            pc.getSpec().getPricePerHour(),
            pc.getLocation(),
            pc.getStatus() == null ? null : pc.getStatus().name(),
            pc.getSpec().getAvailable(),
            plans,
            reviews
        );
    }

    private SubscriptionPlanPriceResponse toPlanResponse(SubscriptionPlan plan) {
        return new SubscriptionPlanPriceResponse(plan.getId(), plan.getPlanName(), plan.getDurationDays(), plan.getPrice());
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlanPriceResponse> getSubscriptionPlansBySpecId(Long specId) {
        return subscriptionPlanRepository.findBySpecIdAndActiveTrueOrderByDurationDaysAsc(specId)
            .stream()
            .map(this::toPlanResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public TierSpecPlanCatalogResponse getTierSpecPlanCatalog() {
        List<MembershipTier> tiers = membershipTierRepository.findAll(Sort.by(Sort.Direction.ASC, "tierLevel"));
        List<MembershipTierSpecMapping> mappings = membershipTierSpecMappingRepository.findAll();
        List<PcSpec> specs = pcSpecRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();

        Map<Long, Long> specToTierId = new HashMap<>();
        for (MembershipTierSpecMapping mapping : mappings) {
            if (mapping.getSpec() != null && mapping.getSpec().getId() != null && mapping.getTier() != null && mapping.getTier().getId() != null) {
                specToTierId.put(mapping.getSpec().getId(), mapping.getTier().getId());
            }
        }

        Map<Long, List<TierSpecPlanPlanResponse>> plansBySpec = new HashMap<>();
        for (SubscriptionPlan plan : plans) {
            if (plan.getSpec() == null || plan.getSpec().getId() == null) {
                continue;
            }
            TierSpecPlanPlanResponse planResponse = new TierSpecPlanPlanResponse(
                plan.getId(),
                plan.getPlanName(),
                plan.getDurationDays(),
                plan.getPrice(),
                plan.getMaxHoursPerDay(),
                plan.getActive()
            );
            plansBySpec.computeIfAbsent(plan.getSpec().getId(), key -> new ArrayList<>()).add(planResponse);
        }

        for (Map.Entry<Long, List<TierSpecPlanPlanResponse>> entry : plansBySpec.entrySet()) {
            entry.getValue().sort(Comparator.comparing((TierSpecPlanPlanResponse p) -> Boolean.TRUE.equals(p.active()) ? 0 : 1)
                .thenComparing(TierSpecPlanPlanResponse::durationDays, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(TierSpecPlanPlanResponse::planId, Comparator.nullsLast(Long::compareTo)));
        }

        Map<Long, List<TierSpecPlanSpecResponse>> specsByTier = new HashMap<>();
        List<TierSpecPlanSpecResponse> unassignedSpecs = new ArrayList<>();

        for (PcSpec spec : specs) {
            TierSpecPlanSpecResponse specResponse = new TierSpecPlanSpecResponse(
                spec.getId(),
                spec.getSpecName(),
                spec.getCpu(),
                spec.getGpu(),
                spec.getRam(),
                spec.getStorage(),
                spec.getOs(),
                spec.getDescription(),
                spec.getPricePerHour(),
                spec.getExclusive(),
                spec.getAvailable(),
                plansBySpec.getOrDefault(spec.getId(), List.of())
            );

            Long tierId = specToTierId.get(spec.getId());
            if (tierId == null) {
                unassignedSpecs.add(specResponse);
                continue;
            }
            specsByTier.computeIfAbsent(tierId, key -> new ArrayList<>()).add(specResponse);
        }

        List<TierSpecPlanTierResponse> tierResponses = tiers.stream()
            .sorted(Comparator.comparing(MembershipTier::getTierLevel, Comparator.nullsLast(Integer::compareTo)))
            .map((tier) -> {
                List<TierSpecPlanSpecResponse> tierSpecs = specsByTier.getOrDefault(tier.getId(), List.of())
                    .stream()
                    .sorted(Comparator.comparing(TierSpecPlanSpecResponse::specId, Comparator.nullsLast(Long::compareTo)))
                    .toList();
                return new TierSpecPlanTierResponse(
                    tier.getId(),
                    tier.getTierName(),
                    tier.getTierLevel(),
                    tier.getActive(),
                    tierSpecs
                );
            })
            .toList();

        List<TierSpecPlanSpecResponse> sortedUnassigned = unassignedSpecs
            .stream()
            .sorted(Comparator.comparing(TierSpecPlanSpecResponse::specId, Comparator.nullsLast(Long::compareTo)))
            .toList();

        return new TierSpecPlanCatalogResponse(tierResponses, sortedUnassigned);
    }

    private ReviewSummaryResponse toReviewResponse(Review review) {
        Integer rating = review.getRating() == null ? null : review.getRating().intValue();
        return new ReviewSummaryResponse(rating, review.getComment(), review.getCreatedAt());
    }
}
