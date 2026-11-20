package com.agileflow.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;

/** Stores dates as ISO-8601 text (SQLite has no native date type; avoids JDBC driver quirks). */
@Converter(autoApply = true)
public class LocalDateConverter implements AttributeConverter<LocalDate, String> {
    public String convertToDatabaseColumn(LocalDate d) { return d == null ? null : d.toString(); }
    public LocalDate convertToEntityAttribute(String s) { return s == null || s.isBlank() ? null : LocalDate.parse(s.substring(0, 10)); }
}
