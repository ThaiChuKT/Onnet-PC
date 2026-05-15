package com.onnet.onnetpc.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class HomeController {

    private final String frontendBaseUrl;

    public HomeController(@Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @GetMapping("/")
    public RedirectView home() {
        return new RedirectView(frontendBaseUrl);
    }
}