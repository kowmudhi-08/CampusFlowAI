package com.campusflow.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        text = text.trim();
        // If date-only format: e.g. "2026-10-25" (length 10)
        if (text.length() == 10 && text.contains("-")) {
            return LocalDate.parse(text).atTime(23, 59, 59);
        }
        // If "2026-10-25T14:30" (length 16)
        if (text.length() == 16) {
            return LocalDateTime.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        }
        try {
            return LocalDateTime.parse(text);
        } catch (Exception e) {
            return LocalDateTime.parse(text, DateTimeFormatter.ISO_DATE_TIME);
        }
    }
}
