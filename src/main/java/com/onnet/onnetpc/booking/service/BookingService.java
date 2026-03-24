package com.onnet.onnetpc.booking.service;

import com.onnet.onnetpc.booking.Booking;
import com.onnet.onnetpc.booking.BookingStatus;
import com.onnet.onnetpc.booking.BookingType;
import com.onnet.onnetpc.booking.dto.BookingHistoryItemResponse;
import com.onnet.onnetpc.booking.dto.BookingPaymentResponse;
import com.onnet.onnetpc.booking.dto.BookingResponse;
import com.onnet.onnetpc.booking.dto.CreateBookingRequest;
import com.onnet.onnetpc.booking.dto.CreateReviewRequest;
import com.onnet.onnetpc.booking.dto.CreateSubscriptionBookingRequest;
import com.onnet.onnetpc.booking.dto.RentMachineRequest;
import com.onnet.onnetpc.booking.dto.RentMachineResponse;
import com.onnet.onnetpc.booking.dto.ReviewSubmitResponse;
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
import com.onnet.onnetpc.session.Session;
import com.onnet.onnetpc.session.SessionQueue;
import com.onnet.onnetpc.session.SessionQueueRepository;
import com.onnet.onnetpc.session.SessionRepository;
import com.onnet.onnetpc.subscription.SubscriptionPlan;
import com.onnet.onnetpc.subscription.repository.SubscriptionPlanRepository;
import com.onnet.onnetpc.wallet.Wallet;
import com.onnet.onnetpc.wallet.WalletTransaction;
import com.onnet.onnetpc.wallet.WalletTransactionType;
import com.onnet.onnetpc.wallet.repository.WalletRepository;
import com.onnet.onnetpc.wallet.repository.WalletTransactionRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PcRepository pcRepository;
    private final PcSpecRepository pcSpecRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SessionRepository sessionRepository;
    private final SessionQueueRepository sessionQueueRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ReviewRepository reviewRepository;

    public BookingService(
        BookingRepository bookingRepository,
        UserRepository userRepository,
        PcRepository pcRepository,
        PcSpecRepository pcSpecRepository,
        SubscriptionPlanRepository subscriptionPlanRepository,
        SessionRepository sessionRepository,
        SessionQueueRepository sessionQueueRepository,
        WalletRepository walletRepository,
        WalletTransactionRepository walletTransactionRepository,
        ReviewRepository reviewRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.pcRepository = pcRepository;
        this.pcSpecRepository = pcSpecRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.sessionRepository = sessionRepository;
        this.sessionQueueRepository = sessionQueueRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public RentMachineResponse rentMachine(String email, RentMachineRequest request) {
        User user = findUserByEmail(email);
        PricingResult pricing = resolvePricing(request.specId(), request.rentalUnit(), request.quantity());

        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wallet not found"));

        BigDecimal currentBalance = wallet.getBalance() == null ? BigDecimal.ZERO : wallet.getBalance();
        if (currentBalance.compareTo(pricing.totalPrice()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }

        Instant startTime = Instant.now();
        Instant endTime = startTime.plus(pricing.duration());

        Pc assignedPc = tryAssignAvailablePc(pricing.spec().getId());
        if (assignedPc == null) {
            Booking queuedBooking = buildBooking(
                user,
                pricing.spec(),
                null,
                pricing.bookingType(),
                pricing.totalHours(),
                startTime,
                endTime,
                pricing.totalPrice(),
                BookingStatus.pending
            );
            Booking savedBooking = bookingRepository.save(queuedBooking);

            Integer maxPosition = sessionQueueRepository.findMaxWaitingPositionForUpdate(pricing.spec().getId());
            int queuePosition = (maxPosition == null ? 0 : maxPosition) + 1;

            SessionQueue queue = new SessionQueue();
            queue.setBooking(savedBooking);
            queue.setUser(user);
            queue.setSpec(pricing.spec());
            queue.setQueuePosition(queuePosition);
            queue.setStatus("waiting");
            sessionQueueRepository.save(queue);

            return new RentMachineResponse(
                savedBooking.getId(),
                true,
                queuePosition,
                null,
                null,
                null,
                pricing.spec().getSpecName(),
                startTime,
                endTime,
                pricing.totalPrice(),
                currentBalance,
                savedBooking.getStatus().name(),
                "All machines are busy. You have been added to the queue."
            );
        }

        BigDecimal newBalance = currentBalance.subtract(pricing.totalPrice());
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(Instant.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setAmount(pricing.totalPrice().negate());
        tx.setType(WalletTransactionType.deduct);
        tx.setReferenceId(null);
        tx.setNote("Rent machine: " + pricing.spec().getSpecName());
        walletTransactionRepository.save(tx);

        assignedPc.setStatus(PcStatus.in_use);
        assignedPc.setUpdatedAt(Instant.now());
        pcRepository.save(assignedPc);

        Booking paidBooking = buildBooking(
            user,
            pricing.spec(),
            assignedPc,
            pricing.bookingType(),
            pricing.totalHours(),
            startTime,
            endTime,
            pricing.totalPrice(),
            BookingStatus.paid
        );
        Booking savedBooking = bookingRepository.save(paidBooking);

        tx.setReferenceId(savedBooking.getId());
        tx.setNote("Booking payment #" + savedBooking.getId());
        walletTransactionRepository.save(tx);

        Session session = new Session();
        session.setBooking(savedBooking);
        session.setUser(user);
        session.setPc(assignedPc);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setTotalCost(pricing.totalPrice());
        session.setStatus("active");
        Session savedSession = sessionRepository.save(session);

        return new RentMachineResponse(
            savedBooking.getId(),
            false,
            null,
            savedSession.getId(),
            assignedPc.getId(),
            assignedPc.getLocation(),
            pricing.spec().getSpecName(),
            startTime,
            endTime,
            pricing.totalPrice(),
            newBalance,
            savedBooking.getStatus().name(),
            "Machine assigned successfully"
        );
    }

    @Transactional
    public BookingResponse createHourlyBooking(String email, CreateBookingRequest request) {
        User user = findUserByEmail(email);
        Pc pc = pcRepository.findById(request.pcId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));

        if (pc.getStatus() != PcStatus.available) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Machine is not available");
        }

        Instant now = Instant.now();
        Instant requestedStartTime = request.startTime();
        if (requestedStartTime.isBefore(now.minus(Duration.ofMinutes(5)))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "startTime is too far in the past");
        }

        Instant startTime = requestedStartTime.isBefore(now) ? now : requestedStartTime;

        Instant endTime = startTime.plus(Duration.ofHours(request.totalHours()));
        boolean overlaps = bookingRepository.existsByPcIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            pc.getId(),
            List.of(BookingStatus.pending, BookingStatus.paid),
            endTime,
            startTime
        );
        if (overlaps) {
            throw new ApiException(HttpStatus.CONFLICT, "Machine is already booked for that time slot");
        }

        BigDecimal hourlyPrice = pc.getSpec().getPricePerHour();
        BigDecimal totalPrice = hourlyPrice.multiply(BigDecimal.valueOf(request.totalHours()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSpec(pc.getSpec());
        booking.setPc(pc);
        booking.setBookingType(BookingType.hourly);
        booking.setTotalHours(request.totalHours());
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.pending);
        booking.setUpdatedAt(Instant.now());

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Transactional
    public BookingResponse createSubscriptionBooking(String email, CreateSubscriptionBookingRequest request) {
        User user = findUserByEmail(email);

        SubscriptionPlan plan = subscriptionPlanRepository.findByIdAndActiveTrue(request.planId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subscription plan not found"));

        if (!plan.getSpec().getId().equals(request.specId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected plan does not belong to the machine group");
        }

        if (plan.getDurationDays() == null || plan.getDurationDays() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid plan duration");
        }

        if (plan.getPrice() == null || plan.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid plan price");
        }

        Instant startTime = Instant.now();
        long totalDays = (long) plan.getDurationDays() * request.quantity();
        Instant endTime = startTime.plus(Duration.ofDays(totalDays));
        BigDecimal totalPrice = plan.getPrice().multiply(BigDecimal.valueOf(request.quantity()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSpec(plan.getSpec());
        booking.setPc(null);
        booking.setBookingType(BookingType.subscription);
        booking.setTotalHours(null);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.pending);
        booking.setUpdatedAt(Instant.now());

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Transactional
    public BookingPaymentResponse payWithWallet(String email, Long bookingId) {
        User user = findUserByEmail(email);
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.pending) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending bookings can be paid");
        }

        if (booking.getTotalPrice() == null || booking.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid booking total price");
        }

        Wallet wallet = walletRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wallet not found"));

        BigDecimal balance = wallet.getBalance() == null ? BigDecimal.ZERO : wallet.getBalance();
        if (balance.compareTo(booking.getTotalPrice()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }

        BigDecimal newBalance = balance.subtract(booking.getTotalPrice());
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(Instant.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setAmount(booking.getTotalPrice().negate());
        tx.setType(WalletTransactionType.deduct);
        tx.setReferenceId(booking.getId());
        tx.setNote("Booking payment");
        walletTransactionRepository.save(tx);

        booking.setStatus(BookingStatus.paid);
        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);

        return new BookingPaymentResponse(booking.getId(), booking.getStatus().name(), newBalance);
    }

    @Transactional(readOnly = true)
    public Page<BookingHistoryItemResponse> getMyBookings(String email, int page, int size) {
        User user = findUserByEmail(email);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
            .map(this::toHistoryItem);
    }

    @Transactional
    public ReviewSubmitResponse submitReview(String email, Long bookingId, CreateReviewRequest request) {
        User user = findUserByEmail(email);
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.completed) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only completed bookings can be reviewed");
        }

        if (booking.getPc() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking has no assigned machine");
        }

        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new ApiException(HttpStatus.CONFLICT, "This booking has already been reviewed");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setPc(booking.getPc());
        review.setRating((byte) request.rating().intValue());
        review.setComment(request.comment());
        review.setStatus(ReviewStatus.pending);

        Review saved = reviewRepository.save(review);
        return new ReviewSubmitResponse(saved.getId(), saved.getStatus().name(), "Review submitted for moderation");
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getPc() == null ? null : booking.getPc().getId(),
            booking.getSpec() == null ? null : booking.getSpec().getSpecName(),
            booking.getBookingType() == null ? null : booking.getBookingType().name(),
            booking.getTotalHours(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getTotalPrice(),
            booking.getStatus() == null ? null : booking.getStatus().name()
        );
    }

    private PricingResult resolvePricing(Long specId, String rentalUnit, Integer quantity) {
        PcSpec spec = pcSpecRepository.findById(specId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine group not found"));

        String unit = rentalUnit == null ? "" : rentalUnit.trim().toLowerCase(Locale.ROOT);
        if (unit.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "rentalUnit is required");
        }

        if (quantity == null || quantity < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "quantity must be at least 1");
        }

        if ("hour".equals(unit)) {
            BigDecimal hourly = spec.getPricePerHour();
            if (hourly == null || hourly.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid hourly price");
            }

            int totalHours = quantity;
            return new PricingResult(
                spec,
                BookingType.hourly,
                totalHours,
                Duration.ofHours(totalHours),
                hourly.multiply(BigDecimal.valueOf(totalHours))
            );
        }

        int durationDays = switch (unit) {
            case "week" -> 7;
            case "month" -> 30;
            case "year" -> 365;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported rentalUnit");
        };

        SubscriptionPlan plan = subscriptionPlanRepository
            .findBySpecIdAndActiveTrueOrderByDurationDaysAsc(specId)
            .stream()
            .filter(item -> item.getDurationDays() != null && item.getDurationDays() == durationDays)
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected rental plan is not available"));

        return new PricingResult(
            spec,
            BookingType.subscription,
            null,
            Duration.ofDays((long) durationDays * quantity),
            plan.getPrice().multiply(BigDecimal.valueOf(quantity))
        );
    }

    private Pc tryAssignAvailablePc(Long specId) {
        return pcRepository.findNextAvailableBySpecIdForUpdate(specId).orElse(null);
    }

    private Booking buildBooking(
        User user,
        PcSpec spec,
        Pc pc,
        BookingType bookingType,
        Integer totalHours,
        Instant startTime,
        Instant endTime,
        BigDecimal totalPrice,
        BookingStatus status
    ) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSpec(spec);
        booking.setPc(pc);
        booking.setBookingType(bookingType);
        booking.setTotalHours(totalHours);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(status);
        booking.setUpdatedAt(Instant.now());
        return booking;
    }

    private record PricingResult(
        PcSpec spec,
        BookingType bookingType,
        Integer totalHours,
        Duration duration,
        BigDecimal totalPrice
    ) {
    }

    private BookingHistoryItemResponse toHistoryItem(Booking booking) {
        Long remainingMinutes = null;
        if (booking.getStatus() == BookingStatus.paid && booking.getEndTime() != null && booking.getEndTime().isAfter(Instant.now())) {
            remainingMinutes = Duration.between(Instant.now(), booking.getEndTime()).toMinutes();
        }

        return new BookingHistoryItemResponse(
            booking.getId(),
            booking.getPc() == null ? null : booking.getPc().getId(),
            booking.getSpec() == null ? null : booking.getSpec().getSpecName(),
            booking.getTotalHours(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getTotalPrice(),
            booking.getStatus() == null ? null : booking.getStatus().name(),
            remainingMinutes,
            booking.getCreatedAt()
        );
    }
}
