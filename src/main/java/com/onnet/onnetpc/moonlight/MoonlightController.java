package com.onnet.onnetpc.moonlight;

import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandRequest;
import com.onnet.onnetpc.moonlight.dto.MoonlightCommandResponse;
import com.onnet.onnetpc.moonlight.dto.SunshineHostResponse;
import com.onnet.onnetpc.moonlight.service.MoonlightService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/moonlight")
public class MoonlightController {

    private final MoonlightService moonlightService;

    public MoonlightController(MoonlightService moonlightService) {
        this.moonlightService = moonlightService;
    }

    @GetMapping("/hosts")
    public ApiResponse<List<SunshineHostResponse>> listEnabledHosts() {
        return ApiResponse.success(moonlightService.listEnabledHosts());
    }

    @PostMapping("/hosts/{hostId}/launch")
    public ApiResponse<MoonlightCommandResponse> launch(
        Authentication authentication,
        @PathVariable Long hostId,
        @Valid @RequestBody MoonlightCommandRequest request
    ) {
        return ApiResponse.success(moonlightService.runUserLaunch(authentication.getName(), hostId, request));
    }
}
