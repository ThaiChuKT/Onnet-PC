package com.onnet.onnetpc.booking.controller;

import com.onnet.onnetpc.booking.dto.BookingHistoryItemResponse;
import com.onnet.onnetpc.booking.dto.BookingPaymentResponse;
import com.onnet.onnetpc.booking.dto.BookingResponse;
import com.onnet.onnetpc.booking.dto.CreateBookingRequest;
import com.onnet.onnetpc.booking.dto.CreateReviewRequest;
import com.onnet.onnetpc.booking.dto.CreateSubscriptionBookingRequest;
import com.onnet.onnetpc.booking.dto.RentMachineRequest;
import com.onnet.onnetpc.booking.dto.RentMachineResponse;
import com.onnet.onnetpc.booking.dto.ReviewSubmitResponse;
import com.onnet.onnetpc.booking.service.BookingService;
import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.session.dto.StartSessionResponse;
import com.onnet.onnetpc.session.service.SessionLifecycleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final SessionLifecycleService sessionLifecycleService;

    public BookingController(BookingService bookingService, SessionLifecycleService sessionLifecycleService) {
        this.bookingService = bookingService;
        this.sessionLifecycleService = sessionLifecycleService;
    }

    @PostMapping("/hourly")
    public ApiResponse<BookingResponse> createHourlyBooking(
        Authentication authentication,
        @Valid @RequestBody CreateBookingRequest request
    ) {
        return ApiResponse.success(bookingService.createHourlyBooking(authentication.getName(), request));
    }

    @PostMapping("/subscription")
    public ApiResponse<BookingResponse> createSubscriptionBooking(
        Authentication authentication,
        @Valid @RequestBody CreateSubscriptionBookingRequest request
    ) {
        return ApiResponse.success(bookingService.createSubscriptionBooking(authentication.getName(), request));
    }

    @PostMapping("/rent")
    public ApiResponse<RentMachineResponse> rentMachine(
        Authentication authentication,
        @RequestBody RentMachineRequest request
    ) {
        return ApiResponse.success(bookingService.rentMachine(authentication.getName(), request));
    }

    @PostMapping("/{bookingId}/pay-wallet")
    public ApiResponse<BookingPaymentResponse> payWithWallet(Authentication authentication, @PathVariable Long bookingId) {
        return ApiResponse.success(bookingService.payWithWallet(authentication.getName(), bookingId));
    }

    @PostMapping("/{bookingId}/cancel")
    public ApiResponse<BookingResponse> cancelBooking(Authentication authentication, @PathVariable Long bookingId) {
        return ApiResponse.success(bookingService.cancelBooking(authentication.getName(), bookingId));
    }

    @PostMapping("/{bookingId}/start-session")
    public ApiResponse<StartSessionResponse> startSession(Authentication authentication, @PathVariable Long bookingId) {
        return ApiResponse.success(sessionLifecycleService.startSession(authentication.getName(), bookingId));
    }

    @GetMapping("/my")
    public ApiResponse<Page<BookingHistoryItemResponse>> getMyBookings(
        Authentication authentication,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(bookingService.getMyBookings(authentication.getName(), page, size));
    }

    @PostMapping("/{bookingId}/reviews")
    public ApiResponse<ReviewSubmitResponse> submitReview(
        Authentication authentication,
        @PathVariable Long bookingId,
        @Valid @RequestBody CreateReviewRequest request
    ) {
        return ApiResponse.success(bookingService.submitReview(authentication.getName(), bookingId, request));
    }
}
