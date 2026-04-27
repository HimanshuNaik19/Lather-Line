package com.latherline.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Token-bucket rate limiter keyed by client IP address.
 * Default policy: 5 requests per 60 seconds.
 */
@Service
public class RateLimiterService {

    /** One Bucket per unique IP; lazily created on first request */
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /** Resolve or create the bucket for a given IP */
    public Bucket resolveBucket(String ip) {
        return buckets.computeIfAbsent(ip, this::newBucket);
    }

    /** Returns true when the request is allowed, false when rate limit exceeded */
    public boolean tryConsume(String ip) {
        return resolveBucket(ip).tryConsume(1);
    }

    private Bucket newBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)                          // 5 tokens max
                .refillGreedy(5, Duration.ofMinutes(1)) // refill 5 per minute
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
