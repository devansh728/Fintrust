package com.digilocker.integration.api.util;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class RateLimiter {
    private final int maxRequests;
    private final long windowMillis;
    private final ConcurrentHashMap<String, UserBucket> buckets = new ConcurrentHashMap<>();

    public RateLimiter(int maxRequests, int windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowMillis = TimeUnit.SECONDS.toMillis(windowSeconds);
    }

    public boolean allow(String userId) {
        long now = System.currentTimeMillis();
        UserBucket bucket = buckets.computeIfAbsent(userId, k -> new UserBucket(now, 0));
        synchronized (bucket) {
            if (now - bucket.windowStart > windowMillis) {
                bucket.windowStart = now;
                bucket.requestCount = 1;
                return true;
            } else if (bucket.requestCount < maxRequests) {
                bucket.requestCount++;
                return true;
            } else {
                return false;
            }
        }
    }

    private static class UserBucket {
        long windowStart;
        int requestCount;
        UserBucket(long windowStart, int requestCount) {
            this.windowStart = windowStart;
            this.requestCount = requestCount;
        }
    }
}
