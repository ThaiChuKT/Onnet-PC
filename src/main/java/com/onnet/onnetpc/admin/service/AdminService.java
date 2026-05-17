package com.onnet.onnetpc.admin.service;

import com.onnet.onnetpc.admin.dto.AdminBookingItemResponse;
import com.onnet.onnetpc.admin.dto.AdminPackageItemResponse;
import com.onnet.onnetpc.admin.dto.AdminPcItemResponse;
import com.onnet.onnetpc.admin.dto.AdminReviewItemResponse;
import com.onnet.onnetpc.admin.dto.AdminSessionItemResponse;
import com.onnet.onnetpc.admin.dto.AdminUserPaymentItemResponse;
import com.onnet.onnetpc.admin.dto.AdminUserItemResponse;
import com.onnet.onnetpc.admin.dto.CreatePcRequest;
import com.onnet.onnetpc.admin.dto.EmailTestResponse;
import com.onnet.onnetpc.admin.dto.SetBookingStatusRequest;
import com.onnet.onnetpc.admin.dto.SetReviewStatusRequest;
import com.onnet.onnetpc.admin.dto.SetUserActiveRequest;
import com.onnet.onnetpc.admin.dto.UpdatePackageRequest;
import com.onnet.onnetpc.admin.dto.UpdatePcRequest;
import com.onnet.onnetpc.booking.entity.Booking;
import com.onnet.onnetpc.booking.enums.BookingStatus;
import com.onnet.onnetpc.booking.enums.BookingType;
import com.onnet.onnetpc.booking.repository.BookingRepository;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.email.EmailSendResult;
import com.onnet.onnetpc.email.TransactionalEmailService;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcSpec;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.Review;
import com.onnet.onnetpc.pcs.ReviewStatus;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.pcs.repository.PcSpecRepository;
import com.onnet.onnetpc.pcs.repository.ReviewRepository;
import com.onnet.onnetpc.session.Session;
import com.onnet.onnetpc.session.SessionRepository;
import com.onnet.onnetpc.session.dto.EndSessionResponse;
import com.onnet.onnetpc.subscription.SubscriptionPlan;
import com.onnet.onnetpc.subscription.repository.SubscriptionPlanRepository;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
import com.onnet.onnetpc.wallet.WalletTransaction;
import com.onnet.onnetpc.wallet.WalletTransactionType;
import com.onnet.onnetpc.wallet.repository.WalletTransactionRepository;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
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
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SessionRepository sessionRepository;
    private final TransactionalEmailService emailService;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;

    public AdminService(
        UserRepository userRepository,
        PcRepository pcRepository,
        PcSpecRepository pcSpecRepository,
        BookingRepository bookingRepository,
        ReviewRepository reviewRepository,
        WalletTransactionRepository walletTransactionRepository,
        SubscriptionPlanRepository subscriptionPlanRepository,
        SessionRepository sessionRepository,
        TransactionalEmailService emailService,
        @Value("${spring.mail.host:smtp.gmail.com}") String mailHost,
        @Value("${spring.mail.port:587}") int mailPort,
        @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.userRepository = userRepository;
        this.pcRepository = pcRepository;
        this.pcSpecRepository = pcSpecRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.sessionRepository = sessionRepository;
        this.emailService = emailService;
        this.mailHost = mailHost;
        this.mailPort = mailPort;
        this.mailUsername = mailUsername == null ? "" : mailUsername.trim();
    }

    public EmailTestResponse sendTestEmail(String to) {
        String target = to == null ? "" : to.trim();
        if (target.isBlank() || !target.contains("@")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A valid target email is required");
        }

        EmailSendResult result = emailService.sendText(
            target,
            "OnnetPC email test",
            "OnnetPC email delivery is working via " + emailService.provider() + ". Sent at " + Instant.now() + "."
        );

        return new EmailTestResponse(
            result.sent(),
            result.provider(),
            mailHost,
            mailPort,
            maskEmail(mailUsername),
            emailService.fromAddress(),
            result.errorType(),
            result.errorMessage()
        );
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
    public AdminUserItemResponse softDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != null && user.getRole().name().equalsIgnoreCase("admin")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot delete admin account");
        }

        Instant now = Instant.now();
        int updatedRows = userRepository.softDeleteNonAdminById(userId, now, now);
        if (updatedRows == 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Account could not be deleted");
        }

        User deletedUser = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found after delete"));
        return toAdminUser(deletedUser);
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
    public AdminUserItemResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return toAdminUser(user);
    }

    @Transactional(readOnly = true)
    public List<AdminBookingItemResponse> listUserOrders(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 100))
            .getContent()
            .stream()
            .map(this::toAdminBooking)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminBookingItemResponse> listUserBookings(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        var bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 100));
        return bookings.getContent()
            .stream()
            .filter(b -> b.getBookingType() == BookingType.subscription)
            .map(this::toAdminBooking)
            .toList();
    }

    @Transactional(readOnly = true)
    public Page<AdminUserPaymentItemResponse> listTopUpPayments(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return walletTransactionRepository
            .findByTypeOrderByCreatedAtDesc(WalletTransactionType.top_up, pageable)
            .map(this::toAdminUserPayment);
    }

    @Transactional(readOnly = true)
    public Page<AdminSessionItemResponse> listSessions(String status, String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size);
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim();
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        return sessionRepository.searchForAdmin(normalizedStatus, normalizedKeyword, pageable).map(this::toAdminSession);
    }

    @Transactional
    public EndSessionResponse forceEndSession(Long sessionId) {
        Session session = sessionRepository.findByIdAndStatusForUpdate(sessionId, "active")
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Only ACTIVE session can be force-ended"));

        Instant now = Instant.now();
        session.setEndTime(now);
        session.setStatus("ended");
        sessionRepository.save(session);

        Booking booking = bookingRepository.findById(session.getBooking().getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        boolean hasRemainingTime = booking.getEndTime() != null && now.isBefore(booking.getEndTime());
        booking.setStatus(hasRemainingTime ? BookingStatus.paid : BookingStatus.expired);
        booking.setUpdatedAt(now);
        bookingRepository.save(booking);

        Pc pc = pcRepository.findByIdForUpdate(session.getPc().getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));
        if (pc.getStatus() != PcStatus.maintenance) {
            pc.setStatus(PcStatus.available);
        }
        pc.setUpdatedAt(now);
        pcRepository.save(pc);

        return new EndSessionResponse(
            session.getId(),
            booking.getId(),
            now,
            true,
            null,
            "Session force-ended on the server. The customer may need to close Moonlight locally.",
            session.getStatus(),
            hasRemainingTime
                ? "Session force-ended by admin. Booking remains paid for remaining time."
                : "Session force-ended by admin. Booking is fully used."
        );
    }

    @Transactional(readOnly = true)
    public Page<AdminPackageItemResponse> listPackages(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return subscriptionPlanRepository.findAll(pageable).map(this::toAdminPackage);
    }

    @Transactional(readOnly = true)
    public AdminPackageItemResponse getPackage(Long planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
        return toAdminPackage(plan);
    }

    @Transactional
    public AdminPackageItemResponse updatePackage(Long planId, UpdatePackageRequest request) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));

        if (request.price() != null) {
            if (request.price().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Price must be greater than 0");
            }
            plan.setPrice(request.price());
        }
        if (request.maxHoursPerDay() != null) {
            if (request.maxHoursPerDay() < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "maxHoursPerDay cannot be negative");
            }
            plan.setMaxHoursPerDay(request.maxHoursPerDay());
        }
        if (request.active() != null) {
            plan.setActive(request.active());
        }

        return toAdminPackage(subscriptionPlanRepository.save(plan));
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
        PcSpec spec;

        if (request.specId() != null) {
            // Use existing spec
            spec = pcSpecRepository.findById(request.specId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Spec not found"));
        } else {
            // Create new spec
            spec = new PcSpec();
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
            spec = pcSpecRepository.save(spec);
        }

        Pc pc = new Pc();
        pc.setSpec(spec);
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
        if (request.available() != null) {
            spec.setAvailable(request.available());
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

    @Transactional
    public AdminPcItemResponse lockPc(Long pcId) {
        Pc pc = pcRepository.findByIdForUpdate(pcId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));

        var activeSessionIds = sessionRepository.findActiveSessionIdsByPcId(pcId);
        for (Long sessionId : activeSessionIds) {
            forceEndSession(sessionId);
        }

        pc.setStatus(PcStatus.maintenance);
        pc.setUpdatedAt(Instant.now());
        return toAdminPc(pcRepository.save(pc));
    }

    @Transactional(readOnly = true)
    public Page<AdminBookingItemResponse> listBookings(String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        if (status == null || status.isBlank()) {
            return bookingRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toAdminBooking);
        }
        BookingStatus bookingStatus = parseBookingStatus(status);
        if (bookingStatus == BookingStatus.expired) {
            return bookingRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(BookingStatus.expired, BookingStatus.completed),
                pageable
            ).map(this::toAdminBooking);
        }
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
        Long subscriptionBookingId = null;
        String subscriptionSpecName = null;
        java.time.Instant subscriptionEndTime = null;
        Long activePcId = null;
        String activePcLocation = null;

        try {
            var page = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 20));
            for (Booking b : page.getContent()) {
                if (b.getBookingType() == BookingType.subscription && b.getStatus() == BookingStatus.paid) {
                    subscriptionBookingId = b.getId();
                    subscriptionSpecName = b.getSpec() == null ? null : b.getSpec().getSpecName();
                    subscriptionEndTime = b.getEndTime();
                    break;
                }
            }
        } catch (Exception ex) {
            
        }

        try {
            var sessions = sessionRepository.findActiveByUserId(user.getId());
            if (sessions != null && !sessions.isEmpty()) {
                Session s = sessions.get(0);
                if (s.getPc() != null) {
                    activePcId = s.getPc().getId();
                    activePcLocation = s.getPc().getLocation();
                }
            }
        } catch (Exception ex) {
            
        }

        return new AdminUserItemResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole() == null ? null : user.getRole().name(),
            user.getActive(),
            user.getVerified(),
            subscriptionBookingId,
            subscriptionSpecName,
            subscriptionEndTime,
            activePcId,
            activePcLocation
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
            pc.getStatus() == null ? null : pc.getStatus().name(),
            resolveTierName(pc.getSpec() == null ? null : pc.getSpec().getId())
        );
    }

    private AdminPackageItemResponse toAdminPackage(SubscriptionPlan plan) {
        return new AdminPackageItemResponse(
            plan.getId(),
            plan.getPlanName(),
            plan.getSpec() == null ? null : plan.getSpec().getId(),
            plan.getSpec() == null ? null : plan.getSpec().getSpecName(),
            resolveTierName(plan.getSpec() == null ? null : plan.getSpec().getId()),
            plan.getDurationDays(),
            plan.getPrice(),
            plan.getMaxHoursPerDay(),
            plan.getActive()
        );
    }

    private String resolveTierName(Long specId) {
        if (specId == null) {
            return null;
        }

        return subscriptionPlanRepository.findBySpecIdAndActiveTrueOrderByDurationDaysAsc(specId)
            .stream()
            .map(SubscriptionPlan::getPlanName)
            .map(this::inferTierName)
            .filter(name -> name != null && !name.isBlank())
            .findFirst()
            .orElse(null);
    }

    private String inferTierName(String planName) {
        if (planName == null || planName.isBlank()) {
            return null;
        }
        String firstWord = planName.trim().split("\\s+", 2)[0];
        return switch (firstWord.toLowerCase(Locale.ROOT)) {
            case "basic" -> "Basic";
            case "pro" -> "Pro";
            case "ultra" -> "Ultra";
            default -> firstWord;
        };
    }

    private AdminBookingItemResponse toAdminBooking(Booking booking) {
        String planName = null;
        Integer durationDays = null;
        
        if (booking.getBookingType() == BookingType.subscription && booking.getSpec() != null) {
            try {
                var plans = subscriptionPlanRepository.findBySpecIdAndActiveTrueOrderByDurationDaysAsc(booking.getSpec().getId());
                if (!plans.isEmpty()) {
                    SubscriptionPlan plan = plans.get(0);
                    planName = plan.getPlanName();
                    durationDays = plan.getDurationDays();
                }
            } catch (Exception ex) {
                // best effort
            }
        }
        
        return new AdminBookingItemResponse(
            booking.getId(),
            booking.getUser() == null ? null : booking.getUser().getId(),
            booking.getUser() == null ? null : booking.getUser().getFullName(),
            booking.getUser() == null ? null : booking.getUser().getEmail(),
            booking.getSpec() == null ? null : booking.getSpec().getSpecName(),
            booking.getPc() == null ? null : booking.getPc().getId(),
            booking.getBookingType() == null ? null : booking.getBookingType().name(),
            booking.getTotalHours(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getTotalPrice(),
            normalizeBookingStatus(booking.getStatus()),
            booking.getCreatedAt(),
            planName,
            durationDays
        );
    }

    private AdminSessionItemResponse toAdminSession(Session session) {
        User user = session.getUser();
        return new AdminSessionItemResponse(
            session.getId(),
            session.getBooking() == null ? null : session.getBooking().getId(),
            user == null ? null : user.getId(),
            user == null ? null : user.getEmail(),
            user == null ? null : user.getFullName(),
            session.getPc() == null ? null : session.getPc().getId(),
            session.getPc() == null ? null : session.getPc().getLocation(),
            session.getStartTime(),
            session.getEndTime(),
            session.getTotalCost(),
            session.getStatus(),
            session.getPc() != null && session.getPc().getSpec() != null ? session.getPc().getSpec().getSpecName() : null

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

    private AdminUserPaymentItemResponse toAdminUserPayment(WalletTransaction tx) {
        User user = tx.getWallet() == null ? null : tx.getWallet().getUser();
        return new AdminUserPaymentItemResponse(
            tx.getId(),
            tx.getWallet() == null ? null : tx.getWallet().getId(),
            user == null ? null : user.getId(),
            user == null ? null : user.getEmail(),
            user == null ? null : user.getFullName(),
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
            String normalized = value.trim().toLowerCase();
            if ("completed".equals(normalized)) {
                return BookingStatus.expired;
            }
            return BookingStatus.valueOf(normalized);
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

    private String normalizeBookingStatus(BookingStatus status) {
        if (status == null) {
            return null;
        }
        if (status == BookingStatus.completed) {
            return BookingStatus.expired.name();
        }
        return status.name();
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return "";
        }
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 2) {
            return local.charAt(0) + "***" + domain;
        }
        return local.substring(0, 2) + "***" + domain;
    }

}
