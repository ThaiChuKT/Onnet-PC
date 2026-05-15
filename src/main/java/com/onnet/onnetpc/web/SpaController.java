package com.onnet.onnetpc.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
        "/{path:^(?!api$|actuator$|assets$)[^\\.]*}",
        "/{path:^(?!api$|actuator$|assets$)[^\\.]*}/**"
    })
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}