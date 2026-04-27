package com.latherline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class LatherLineApplication {
    public static void main(String[] args) {
        SpringApplication.run(LatherLineApplication.class, args);
    }
}
