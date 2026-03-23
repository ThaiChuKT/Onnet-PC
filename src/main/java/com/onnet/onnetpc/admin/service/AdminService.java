package com.onnet.onnetpc.admin.service;

import com.onnet.onnetpc.admin.dto.AdminBookingItemResponse;
import com.onnet.onnetpc.admin.dto.AdminPcItemResponse;
import com.onnet.onnetpc.admin.dto.AdminReviewItemResponse;
import com.onnet.onnetpc.admin.dto.AdminUserPaymentItemResponse;
import com.onnet.onnetpc.admin.dto.AdminUserItemResponse;
import com.onnet.onnetpc.admin.dto.CreatePcRequest;
import com.onnet.onnetpc.admin.dto.SetBookingStatusRequest;
import com.onnet.onnetpc.admin.dto.SetReviewStatusRequest;
import com.onnet.onnetpc.admin.dto.SetUserActiveRequest;
import com.onnet.onnetpc.admin.dto.UpdatePcRequest;
import com.onnet.onnetpc.booking.Booking;
import com.onnet.onnetpc.booking.BookingStatus;
import com.onnet.onnetpc.booking.repository.BookingRepository;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcSpec;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.Review;
import com.onnet.onnetpc.pcs.ReviewStatus;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.pcs.repository.PcSpecRepository;
import com.onnet.onnetpc.pcs.repository.ReviewRepository;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
import com.onnet.onnetpc.wallet.WalletTransaction;
import com.onnet.onnetpc.wallet.repository.WalletTransactionRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PcRepository pcRepository;
    private final PcSpecRepository pcSpecRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public AdminService(
        UserRepository userRepository,
        PcRepository pcRepository,
        PcSpecRepository pcSpecRepository,
        BookingRepository bookingRepository,
        ReviewRepository reviewRepository,
        WalletTransactionRepository walletTransactionRepository
    ) {
        this.userRepository = userRepository;
        this.pcRepository = pcRepository;
        this.pcSpecRepository = pcSpecRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserItemResponse> listUsers(String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (keyword == null || keyword.isBlank()) {
            Page<User> filteredPage = userRepository.findByDeletedAtIsNull(pageable);
            if (filteredPage.isEmpty()) {
                return userRepository.findAll(pageable).map(this::toAdminUser);
            }
            return filteredPage.map(this::toAdminUser);
        }

        String search = keyword.trim();
        Page<User> filteredSearch = userRepository
            .findByDeletedAtIsNullAndFullNameContainingIgnoreCaseOrDeletedAtIsNullAndEmailContainingIgnoreCase(
                search,
                search,
                pageable
            );
        if (filteredSearch.isEmpty()) {
            return userRepository
                .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable)
                .map(this::toAdminUser);
        }
        return filteredSearch.map(this::toAdminUser);
    }

    @Transactional
    public AdminUserItemResponse setUserActive(Long userId, SetUserActiveRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(request.active());
        user.setUpdatedAt(Instant.now());
        return toAdminUser(userRepository.save(user));
    }

    @Transactional
    public void softDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != null && user.getRole().name().equalsIgnoreCase("admin")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot delete admin account");
        }

        user.setActive(false);
        user.setDeletedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<AdminUserPaymentItemResponse> listUserPayments(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return walletTransactionRepository.findTop100ByWalletUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map((tx) -> toAdminUserPayment(user, tx))
            .toList();
    }

    @Transactional(readOnly = true)
    public Page<AdminPcItemResponse> listPcs(String status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (status == null || status.isBlank()) {
            return pcRepository.findByDeletedAtIsNull(pageable).map(this::toAdminPc);
        }
        PcStatus pcStatus = parsePcStatus(status);
        return pcRepository.findByDeletedAtIsNullAndStatus(pcStatus, pageable).map(this::toAdminPc);
    }

    @Transactional
    public AdminPcItemResponse createPc(CreatePcRequest request) {
        PcSpec spec = new PcSpec();
        spec.setSpecName(request.specName());
        spec.setCpu(request.cpu());
        spec.setGpu(request.gpu());
        spec.setRam(request.ram());
        spec.setStorage(request.storage());
        spec.setOs(request.operatingSystem());
        spec.setDescription(request.description());
        spec.setPricePerHour(request.pricePerHour());
        spec.setAvailable(true);
        spec.setExclusive(false);
        PcSpec savedSpec = pcSpecRepository.save(spec);

        Pc pc = new Pc();
        pc.setSpec(savedSpec);
        pc.setLocation(request.location());
        pc.setStatus(parsePcStatusOrDefault(request.status(), PcStatus.available));
        pc.setUpdatedAt(Instant.now());
        return toAdminPc(pcRepository.save(pc));
    }

    @Transactional
    public AdminPcItemResponse updatePc(Long pcId, UpdatePcRequest request) {
        Pc pc = pcRepository.findById(pcId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));

        if (request.location() != null) {
            pc.setLocation(request.location());
        }
        if (request.status() != null) {
            pc.setStatus(parsePcStatus(request.status()));
        }
        pc.setUpdatedAt(Instant.now());

        PcSpec spec = pc.getSpec();
        if (request.specName() != null) {
            spec.setSpecName(request.specName());
        }
        if (request.cpu() != null) {
            spec.setCpu(request.cpu());
        }
        if (request.gpu() != null) {
            spec.setGpu(request.gpu());
        }
        if (request.ram() != null) {
            spec.setRam(request.ram());
        }
        if (request.storage() != null) {
            spec.setStorage(request.storage());
        }
        if (request.operatingSystem() != null) {
            spec.setOs(request.operatingSystem());
        }
        if (request.description() != null) {
            spec.setDescription(request.description());
        }
        if (request.pricePerHour() != null) {
            spec.setPricePerHour(request.pricePerHour());
        }

        pcSpecRepository.save(spec);
        return toAdminPc(pcRepository.save(pc));
    }

    @Transactional
    public void softDeletePc(Long pcId) {
        Pc pc = pcRepository.findById(pcId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));
        pc.setDeletedAt(Instant.now());
        pc.setStatus(PcStatus.maintenance);
        pc.setUpdatedAt(Instant.now());
        pcRepository.save(pc);
    }

    @Transactional(readOnly = true)
    public Page<AdminBookingItemResponse> listBookings(String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        if (status == null || status.isBlank()) {
            return bookingRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toAdminBooking);
        }
        BookingStatus bookingStatus = parseBookingStatus(status);
        return bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus, pageable).map(this::toAdminBooking);
    }

    @Transactional
    public AdminBookingItemResponse setBookingStatus(Long bookingId, SetBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        booking.setStatus(parseBookingStatus(request.status()));
        booking.setUpdatedAt(Instant.now());
        return toAdminBooking(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public Page<AdminReviewItemResponse> listPendingReviews(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return reviewRepository.findByStatus(ReviewStatus.pending, pageable).map(this::toAdminReview);
    }

    @Transactional
    public AdminReviewItemResponse setReviewStatus(Long reviewId, SetReviewStatusRequest request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
        review.setStatus(parseReviewStatus(request.status()));
        return toAdminReview(reviewRepository.save(review));
    }

    private AdminUserItemResponse toAdminUser(User user) {
        return new AdminUserItemResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole() == null ? null : user.getRole().name(),
            user.getActive(),
            user.getVerified()
        );
    }

    private AdminPcItemResponse toAdminPc(Pc pc) {
        return new AdminPcItemResponse(
            pc.getId(),
            pc.getSpec().getId(),
            pc.getSpec().getSpecName(),
            pc.getSpec().getCpu(),
            pc.getSpec().getGpu(),
            pc.getSpec().getRam(),
            pc.getSpec().getStorage(),
            pc.getSpec().getOs(),
            pc.getSpec().getPricePerHour(),
            pc.getLocation(),
            pc.getStatus() == null ? null : pc.getStatus().name()
        );
    }

    private AdminBookingItemResponse toAdminBooking(Booking booking) {
        return new AdminBookingItemResponse(
            booking.getId(),
            booking.getUser() == null ? null : booking.getUser().getEmail(),
            booking.getSpec() == null ? null : booking.getSpec().getSpecName(),
            booking.getPc() == null ? null : booking.getPc().getId(),
            booking.getBookingType() == null ? null : booking.getBookingType().name(),
            booking.getTotalHours(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getTotalPrice(),
            booking.getStatus() == null ? null : booking.getStatus().name(),
            booking.getCreatedAt()
        );
    }

    private AdminReviewItemResponse toAdminReview(Review review) {
        return new AdminReviewItemResponse(
            review.getId(),
            review.getBooking() == null ? null : review.getBooking().getId(),
            review.getPc() == null ? null : review.getPc().getId(),
            review.getUser() == null ? null : review.getUser().getEmail(),
            review.getRating() == null ? null : review.getRating().intValue(),
            review.getComment(),
            review.getStatus() == null ? null : review.getStatus().name(),
            review.getCreatedAt()
        );
    }

    private AdminUserPaymentItemResponse toAdminUserPayment(User user, WalletTransaction tx) {
        return new AdminUserPaymentItemResponse(
            tx.getId(),
            tx.getWallet() == null ? null : tx.getWallet().getId(),
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            tx.getAmount(),
            tx.getType() == null ? null : tx.getType().name(),
            tx.getReferenceId(),
            tx.getNote(),
            tx.getCreatedAt()
        );
    }

    private PcStatus parsePcStatus(String value) {
        try {
            return PcStatus.valueOf(value.trim().toLowerCase());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid pc status");
        }
    }

    private PcStatus parsePcStatusOrDefault(String value, PcStatus defaultStatus) {
        if (value == null || value.isBlank()) {
            return defaultStatus;
        }
        return parsePcStatus(value);
    }

    private BookingStatus parseBookingStatus(String value) {
        try {
            return BookingStatus.valueOf(value.trim().toLowerCase());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid booking status");
        }
    }

    private ReviewStatus parseReviewStatus(String value) {
        try {
            return ReviewStatus.valueOf(value.trim().toLowerCase());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid review status");
        }
    }
}
