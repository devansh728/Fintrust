package com.fintrust.Consent.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;

@Data
@Document(collection = "bank_admins")
public class BankAdmin {
    @Id
    private String adminId;

    @Field("public_key")
    private String publicKey;

    private String email;
}
