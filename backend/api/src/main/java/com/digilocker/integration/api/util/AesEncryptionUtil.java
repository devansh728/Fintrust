package com.digilocker.integration.api.util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

public class AesEncryptionUtil {
    private static final String AES = "AES";
    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    public static String encrypt(String plainText, byte[] key) throws Exception {
        Cipher cipher = Cipher.getInstance(AES_GCM);
        byte[] iv = new byte[IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        SecretKeySpec keySpec = new SecretKeySpec(key, AES);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes());
        byte[] encryptedIvAndText = new byte[IV_LENGTH + encrypted.length];
        System.arraycopy(iv, 0, encryptedIvAndText, 0, IV_LENGTH);
        System.arraycopy(encrypted, 0, encryptedIvAndText, IV_LENGTH, encrypted.length);
        return Base64.getEncoder().encodeToString(encryptedIvAndText);
    }

    public static String decrypt(String cipherText, byte[] key) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(cipherText);
        byte[] iv = new byte[IV_LENGTH];
        System.arraycopy(decoded, 0, iv, 0, IV_LENGTH);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        SecretKeySpec keySpec = new SecretKeySpec(key, AES);
        Cipher cipher = Cipher.getInstance(AES_GCM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);
        byte[] encrypted = new byte[decoded.length - IV_LENGTH];
        System.arraycopy(decoded, IV_LENGTH, encrypted, 0, encrypted.length);
        byte[] original = cipher.doFinal(encrypted);
        return new String(original);
    }

    public static byte[] generateKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(AES);
        keyGen.init(256);
        SecretKey secretKey = keyGen.generateKey();
        return secretKey.getEncoded();
    }
}
