package com.onnet.onnetpc.pcs.repository;

import com.onnet.onnetpc.pcs.Review;
import com.onnet.onnetpc.pcs.ReviewStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findTop20ByPcIdAndStatusOrderByCreatedAtDesc(Long pcId, ReviewStatus status);

    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);

    boolean existsByBookingId(Long bookingId);
}
