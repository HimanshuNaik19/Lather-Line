package com.latherline.repository;

import com.latherline.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByActiveTrue();
    java.util.Optional<Business> findByCode(String code);
}
