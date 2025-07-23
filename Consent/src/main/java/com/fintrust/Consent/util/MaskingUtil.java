package com.fintrust.Consent.util;

import org.springframework.stereotype.Component;

@Component
public class MaskingUtil {
    public String maskAadhar(String aadhar) {
        if (aadhar == null || aadhar.length() < 4) return "****";
        return "XXXX-XXXX-" + aadhar.substring(aadhar.length() - 4);
    }
    public String maskPan(String pan) {
        if (pan == null || pan.length() < 4) return "****";
        return pan.substring(0, 4) + "*****";
    }
    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "+91-XXX-XXX-" + phone.substring(phone.length() - 4);
    }
    public String maskAccount(String account) {
        if (account == null || account.length() < 4) return "****";
        return "XXXXXX" + account.substring(account.length() - 4);
    }
}
