package com.latherline;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class LatherLineApplicationTests {

    @Test
    void contextLoads() {
        // Spring context should start without errors
    }
}
