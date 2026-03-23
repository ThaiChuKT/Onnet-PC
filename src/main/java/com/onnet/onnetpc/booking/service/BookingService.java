package com.onnet.onnetpc.booking.service;

import com.onnet.onnetpc.booking.Booking;
import com.onnet.onnetpc.booking.BookingStatus;
import com.onnet.onnetpc.booking.BookingType;
import com.onnet.onnetpc.booking.dto.BookingHistoryItemResponse;
import com.onnet.onnetpc.booking.dto.BookingPaymentResponse;
import com.onnet.onnetpc.booking.dto.BookingResponse;
import com.onnet.onnetpc.booking.dto.CreateBookingRequest;
import com.onnet.onnetpc.booking.dto.CreateReviewRequest;
import com.onnet.onnetpc.booking.dto.ReviewSubmitResponse;
import com.onnet.onnetpc.booking.repository.BookingRepository;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcStatus;
import com.onnet.onnetpc.pcs.Review;
import com.onnet.onnetpc.pcs.ReviewStatus;
import com.onnet.onnetpc.pcs.repository.PcRepository;
import com.onnet.onnetpc.pcs.repository.ReviewRepository;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
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
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ReviewRepository reviewRepository;

    public BookingService(
        BookingRepository bookingRepository,
        UserRepository userRepository,
        PcRepository pcRepository,
        WalletRepository walletRepository,
        WalletTransactionRepository walletTransactionRepository,
        ReviewRepository reviewRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.pcRepository = pcRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public BookingResponse createHourlyBooking(String email, CreateBookingRequest request) {
        User user = findUserByEmail(email);
        Pc pc = pcRepository.findById(request.pcId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Machine not found"));

        if (pc.getStatus() != PcStatus.available) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Machine is not available");
        }

        Instant startTime = request.startTime();
        if (startTime.isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "startTime must be in the future");
        }

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
