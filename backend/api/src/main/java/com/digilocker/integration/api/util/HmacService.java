package com.digilocker.integration.api.util;

import org.apache.commons.codec.binary.Hex;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
public class HmacService {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final byte[] clientSecret;

    public HmacService(String clientSecret) {
        this.clientSecret = clientSecret.getBytes(StandardCharsets.UTF_8);
    }

    public String generateHmac(byte[] fileContent) {
        try {
            Mac hmac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKey = new SecretKeySpec(clientSecret, HMAC_ALGORITHM);
            hmac.init(secretKey);
            byte[] hmacBytes = hmac.doFinal(fileContent);
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new HmacGenerationException("Failed to generate HMAC", e);
        }
    }

    public boolean validateHmac(byte[] fileContent, String receivedHmac) {
        if (receivedHmac == null || receivedHmac.isEmpty()) {
            throw new HmacValidationException("No HMAC provided for validation");
        }

        String calculatedHmac = generateHmac(fileContent);
        return calculatedHmac.equals(receivedHmac);
    }

    public static class HmacGenerationException extends RuntimeException {
        public HmacGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class HmacValidationException extends RuntimeException {
        public HmacValidationException(String message) {
            super(message);
        }
    }
}
