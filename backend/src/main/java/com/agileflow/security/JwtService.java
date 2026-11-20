package com.agileflow.security;

import com.agileflow.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.SecureRandom;
import java.util.*;

@Service
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${agileflow.jwt.secret:}") String secret,
                      @Value("${agileflow.jwt.expiration-ms:86400000}") long expirationMs) {
        String s = (secret == null || secret.isBlank()) ? loadOrCreateSecret() : secret;
        this.key = Keys.hmacShaKeyFor(s.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    private static String loadOrCreateSecret() {
        Path p = Path.of(".agileflow-jwt-secret");
        try {
            if (Files.exists(p)) return Files.readString(p).trim();
            byte[] b = new byte[48];
            new SecureRandom().nextBytes(b);
            String s = Base64.getEncoder().encodeToString(b);
            Files.writeString(p, s);
            log.warn("JWT_SECRET not set: generated a random secret and stored it in {}", p.toAbsolutePath());
            return s;
        } catch (IOException e) {
            log.warn("JWT_SECRET not set and secret file not writable; using an ephemeral secret (tokens reset on restart)");
            byte[] b = new byte[48];
            new SecureRandom().nextBytes(b);
            return Base64.getEncoder().encodeToString(b);
        }
    }

    public String generate(User user) {
        Date now = new Date();
        return Jwts.builder().subject(String.valueOf(user.getId())).claim("email", user.getEmail())
                .issuedAt(now).expiration(new Date(now.getTime() + expirationMs)).signWith(key).compact();
    }

    public Optional<AuthUser> parse(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return Optional.of(new AuthUser(Long.valueOf(c.getSubject()), c.get("email", String.class)));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
