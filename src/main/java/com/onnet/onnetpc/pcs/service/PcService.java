package com.onnet.onnetpc.pcs.service;

import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.Review;
import com.onnet.onnetpc.pcs.ReviewStatus;
import com.onnet.onnetpc.pcs.dto.MachineDetailResponse;
import com.onnet.onnetpc.pcs.dto.MachineListItemResponse;
import com.onnet.onnetpc.pcs.dto.ReviewSummaryResponse;
import com.onnet.onnetpc.pcs.dto.SubscriptionPlanPriceResponse;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.pcs.repository.ReviewRepository;
import com.onnet.onnetpc.subscription.SubscriptionPlan;
import com.onnet.onnetpc.subscription.repository.SubscriptionPlanRepository;
import java.math.BigDecimal;
import java.util.List;
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
    private final ReviewRepository reviewRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    public PcService(
        PcRepository pcRepository,
        ReviewRepository reviewRepository,
        SubscriptionPlanRepository subscriptionPlanRepository
    ) {
        this.pcRepository = pcRepository;
        this.reviewRepository = reviewRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
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

    private ReviewSummaryResponse toReviewResponse(Review review) {
        Integer rating = review.getRating() == null ? null : review.getRating().intValue();
        return new ReviewSummaryResponse(rating, review.getComment(), review.getCreatedAt());
    }
}
