package com.reeltrip.api.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {

    @GetMapping({"/", "/doc", "/docs"})
    public String redirectToDocs() {
        return "redirect:/docs/index.html";
    }
}
