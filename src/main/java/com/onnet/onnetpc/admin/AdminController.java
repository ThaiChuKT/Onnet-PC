package com.onnet.onnetpc.admin;

import com.onnet.onnetpc.admin.dto.AdminBookingItemResponse;
import com.onnet.onnetpc.admin.dto.AdminPackageItemResponse;
import com.onnet.onnetpc.admin.dto.AdminPcItemResponse;
import com.onnet.onnetpc.admin.dto.AdminReviewItemResponse;
import com.onnet.onnetpc.admin.dto.AdminUserPaymentItemResponse;
import com.onnet.onnetpc.admin.dto.AdminUserItemResponse;
import com.onnet.onnetpc.admin.dto.CreatePcRequest;
import com.onnet.onnetpc.admin.dto.SetBookingStatusRequest;
import com.onnet.onnetpc.admin.dto.SetReviewStatusRequest;
import com.onnet.onnetpc.admin.dto.SetUserActiveRequest;
import com.onnet.onnetpc.admin.dto.UpdatePackageRequest;
import com.onnet.onnetpc.admin.dto.UpdatePcRequest;
import com.onnet.onnetpc.admin.service.AdminService;
import com.onnet.onnetpc.common.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ApiResponse<Page<AdminUserItemResponse>> listUsers(
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(adminService.listUsers(keyword, page, size));
    }

    @PatchMapping("/users/{userId}/active")
    public ApiResponse<AdminUserItemResponse> setUserActive(
        @PathVariable Long userId,
        @Valid @RequestBody SetUserActiveRequest request
    ) {
        return ApiResponse.success(adminService.setUserActive(userId, request));
    }

    @DeleteMapping("/users/{userId}")
    public ApiResponse<String> deleteUser(@PathVariable Long userId) {
        adminService.softDeleteUser(userId);
        return ApiResponse.success("User deleted");
    }

    @GetMapping("/users/{userId}/payments")
    public ApiResponse<List<AdminUserPaymentItemResponse>> listUserPayments(@PathVariable Long userId) {
        return ApiResponse.success(adminService.listUserPayments(userId));
    }

    @GetMapping("/payments/topups")
    public ApiResponse<Page<AdminUserPaymentItemResponse>> listTopUpPayments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(adminService.listTopUpPayments(page, size));
    }

    @GetMapping("/packages")
    public ApiResponse<Page<AdminPackageItemResponse>> listPackages(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(adminService.listPackages(page, size));
    }

    @GetMapping("/packages/{planId}")
    public ApiResponse<AdminPackageItemResponse> getPackage(@PathVariable Long planId) {
        return ApiResponse.success(adminService.getPackage(planId));
    }

    @PatchMapping("/packages/{planId}")
    public ApiResponse<AdminPackageItemResponse> updatePackage(
        @PathVariable Long planId,
        @RequestBody UpdatePackageRequest request
    ) {
        return ApiResponse.success(adminService.updatePackage(planId, request));
    }

    @GetMapping("/pcs")
    public ApiResponse<Page<AdminPcItemResponse>> listPcs(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(adminService.listPcs(status, page, size));
    }

    @PostMapping("/pcs")
    public ApiResponse<AdminPcItemResponse> createPc(@Valid @RequestBody CreatePcRequest request) {
        return ApiResponse.success(adminService.createPc(request));
    }

    @PatchMapping("/pcs/{pcId}")
    public ApiResponse<AdminPcItemResponse> updatePc(@PathVariable Long pcId, @RequestBody UpdatePcRequest request) {
        return ApiResponse.success(adminService.updatePc(pcId, request));
    }

    @DeleteMapping("/pcs/{pcId}")
    public ApiResponse<String> softDeletePc(@PathVariable Long pcId) {
        adminService.softDeletePc(pcId);
        return ApiResponse.success("Machine soft-deleted");
    }

    @GetMapping("/bookings")
    public ApiResponse<Page<AdminBookingItemResponse>> listBookings(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(adminService.listBookings(status, page, size));
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ApiResponse<AdminBookingItemResponse> setBookingStatus(
        @PathVariable Long bookingId,
        @Valid @RequestBody SetBookingStatusRequest request
    ) {
        return ApiResponse.success(adminService.setBookingStatus(bookingId, request));
    }

    @GetMapping("/reviews/pending")
    public ApiResponse<Page<AdminReviewItemResponse>> listPendingReviews(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(adminService.listPendingReviews(page, size));
    }

    @PatchMapping("/reviews/{reviewId}/status")
    public ApiResponse<AdminReviewItemResponse> setReviewStatus(
        @PathVariable Long reviewId,
        @Valid @RequestBody SetReviewStatusRequest request
    ) {
        return ApiResponse.success(adminService.setReviewStatus(reviewId, request));
    }
}
