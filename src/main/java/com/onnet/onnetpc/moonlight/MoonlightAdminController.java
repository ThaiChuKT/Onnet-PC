package com.onnet.onnetpc.moonlight;

import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.moonlight.dto.CreateSunshineHostRequest;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandLogItemResponse;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandRequest;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandResponse;
import com.onnet.onnetpc.moonlight.dto.SunshineHostResponse;
import com.onnet.onnetpc.moonlight.dto.UpdateSunshineHostRequest;
import com.onnet.onnetpc.moonlight.service.MoonlightService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/moonlight")
public class MoonlightAdminController {

    private final MoonlightService moonlightService;

    public MoonlightAdminController(MoonlightService moonlightService) {
        this.moonlightService = moonlightService;
    }

    @GetMapping("/hosts")
    public ApiResponse<List<SunshineHostResponse>> listHosts() {
        return ApiResponse.success(moonlightService.listAdminHosts());
    }

    @PostMapping("/hosts")
    public ApiResponse<SunshineHostResponse> createHost(
        Authentication authentication,
        @Valid @RequestBody CreateSunshineHostRequest request
    ) {
        return ApiResponse.success(moonlightService.createHost(authentication.getName(), request));
    }

    @PatchMapping("/hosts/{hostId}")
    public ApiResponse<SunshineHostResponse> updateHost(
        @PathVariable Long hostId,
        @Valid @RequestBody UpdateSunshineHostRequest request
    ) {
        return ApiResponse.success(moonlightService.updateHost(hostId, request));
    }

    @DeleteMapping("/hosts/{hostId}")
    public ApiResponse<String> deleteHost(@PathVariable Long hostId) {
        return ApiResponse.success(moonlightService.deleteHost(hostId));
    }

    @PostMapping("/hosts/{hostId}/commands")
    public ApiResponse<MoonlightCommandResponse> runCommand(
        Authentication authentication,
        @PathVariable Long hostId,
        @Valid @RequestBody MoonlightCommandRequest request
    ) {
        return ApiResponse.success(moonlightService.runAdminCommand(authentication.getName(), hostId, request));
    }

    @GetMapping("/hosts/{hostId}/commands")
    public ApiResponse<List<MoonlightCommandLogItemResponse>> listCommandLogs(@PathVariable Long hostId) {
        return ApiResponse.success(moonlightService.listRecentLogs(hostId));
    }
}
