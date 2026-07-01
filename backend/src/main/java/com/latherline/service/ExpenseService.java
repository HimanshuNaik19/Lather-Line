package com.latherline.service;

import com.latherline.entity.Expense;
import com.latherline.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public List<Expense> getExpenses(Long businessId) {
        return expenseRepository.findByBusinessId(businessId);
    }

    public Expense createExpense(Long businessId, Expense expense) {
        expense.setBusinessId(businessId);
        return expenseRepository.save(expense);
    }
}
