package com.aka.bookstore;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class WelcomeController {
    @GetMapping("/welcome")
    public String welcome() {
        return "welcome haha";
    }
    
}
