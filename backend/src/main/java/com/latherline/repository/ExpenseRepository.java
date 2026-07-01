package com.latherline.repository;

import com.latherline.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByBusinessId(Long businessId);
    List<Expense> findByBusinessIdAndExpenseDateBetween(Long businessId, LocalDate startDate, LocalDate endDate);
}
