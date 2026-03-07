package org.example.restaurantmanager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "redirect:/HTML/Home.html";
    }

    @GetMapping("/menu")
    public String menu() {
        return "redirect:/HTML/Menu.html";
    }

    @GetMapping("/admin")
    public String admin() {
        return "redirect:/HTML/Admin.html";
    }

    @GetMapping("/staff")
    public String staff() {
        return "redirect:/HTML/staff.html";
    }
}
