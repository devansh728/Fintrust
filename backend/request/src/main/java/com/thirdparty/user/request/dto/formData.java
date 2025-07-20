package com.thirdparty.user.request.dto;

import com.thirdparty.user.request.domain.DocumentEntry;
import com.thirdparty.user.request.domain.FieldEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Builder
@AllArgsConstructor
@Data
public class formData {
    private List<FieldEntry> textFields;
    private List<DocumentEntry> fileUploads;
}
