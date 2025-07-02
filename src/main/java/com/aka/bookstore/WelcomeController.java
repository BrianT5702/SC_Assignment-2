package com.aka.bookstore;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;


@RestController
public class WelcomeController {
    @GetMapping("/welcome")
    public String welcome() {
        return "welcome haha";
    }

    @RequestMapping("/")
    public RedirectView redirectToIndex() {
        return new RedirectView("/index.html");
    }
}
