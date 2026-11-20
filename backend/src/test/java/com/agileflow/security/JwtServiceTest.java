package com.agileflow.security;

import com.agileflow.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = "unit-test-secret-unit-test-secret-1234567890";

    private User user() { User u = new User(); u.setId(42L); u.setEmail("x@y.com"); return u; }

    @Test
    void roundTrip() {
        JwtService s = new JwtService(SECRET, 60000);
        AuthUser a = s.parse(s.generate(user())).orElseThrow();
        assertEquals(42L, a.id());
        assertEquals("x@y.com", a.email());
    }

    @Test
    void rejectsTamperedAndForeignTokens() {
        JwtService s = new JwtService(SECRET, 60000);
        String token = s.generate(user());
        assertTrue(s.parse(token + "x").isEmpty());
        assertTrue(new JwtService("another-secret-another-secret-1234567890", 60000).parse(token).isEmpty());
        assertTrue(s.parse("garbage").isEmpty());
    }

    @Test
    void rejectsExpiredToken() {
        JwtService s = new JwtService(SECRET, -1000);
        assertTrue(s.parse(s.generate(user())).isEmpty());
    }
}
