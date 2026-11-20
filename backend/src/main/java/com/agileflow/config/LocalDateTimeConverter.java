package com.agileflow.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDateTime;

@Converter(autoApply = true)
public class LocalDateTimeConverter implements AttributeConverter<LocalDateTime, String> {
    public String convertToDatabaseColumn(LocalDateTime d) { return d == null ? null : d.toString(); }
    public LocalDateTime convertToEntityAttribute(String s) { return s == null || s.isBlank() ? null : LocalDateTime.parse(s.replace(' ', 'T')); }
}
