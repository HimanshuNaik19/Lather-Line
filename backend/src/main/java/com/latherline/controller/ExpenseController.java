package com.latherline.controller;

import com.latherline.entity.Expense;
import com.latherline.entity.User;
import com.latherline.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.latherline.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(expenseService.getExpenses(user.getBusinessId()));
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Expense expense) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(expenseService.createExpense(user.getBusinessId(), expense));
    }
}
