package com.onnet.onnetpc.session.controller;

import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.session.dto.ActiveSessionResponse;
import com.onnet.onnetpc.session.dto.EndSessionResponse;
import com.onnet.onnetpc.session.service.SessionLifecycleService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sessions")
public class SessionController {

    private final SessionLifecycleService sessionLifecycleService;

    public SessionController(SessionLifecycleService sessionLifecycleService) {
        this.sessionLifecycleService = sessionLifecycleService;
    }

    @GetMapping("/current")
    public ApiResponse<ActiveSessionResponse> getCurrentSession(Authentication authentication) {
        return ApiResponse.success(sessionLifecycleService.getCurrentSession(authentication.getName()));
    }

    @PostMapping("/current/end")
    public ApiResponse<EndSessionResponse> endCurrentSession(Authentication authentication) {
        return ApiResponse.success(sessionLifecycleService.endCurrentSession(authentication.getName()));
    }
}
