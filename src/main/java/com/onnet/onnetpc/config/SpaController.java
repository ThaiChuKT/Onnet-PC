package com.onnet.onnetpc.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
        "/",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/computers",
        "/computers/{id}",
        "/packages",
        "/packages/{tier}",
        "/ai-chat",
        "/checkout",
        "/wallet",
        "/faq-admin",
        "/account",
        "/account/{*path}",
        "/faq",
        "/dashboard",
        "/dashboard/{*path}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
