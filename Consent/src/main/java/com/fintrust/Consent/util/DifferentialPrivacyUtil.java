package com.fintrust.Consent.util;

import org.springframework.stereotype.Component;
import java.util.Random;

@Component
public class DifferentialPrivacyUtil {
    private final Random random = new Random();

    public double addNoise(double value, double epsilon) {
        // Laplace mechanism for differential privacy
        double scale = 1.0 / epsilon;
        double noise = laplace(0, scale);
        return value + noise;
    }

    private double laplace(double mu, double b) {
        double u = random.nextDouble() - 0.5;
        return mu - b * Math.signum(u) * Math.log(1 - 2 * Math.abs(u));
    }
}
