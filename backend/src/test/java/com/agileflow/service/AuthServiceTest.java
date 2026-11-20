package com.agileflow.service;

import com.agileflow.dto.Dtos.*;
import com.agileflow.entity.User;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.UserRepository;
import com.agileflow.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository users;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    JwtService jwt = new JwtService("unit-test-secret-unit-test-secret-1234567890", 60000);
    AuthService service;

    @BeforeEach
    void setUp() { service = new AuthService(users, encoder, jwt); }

    @Test
    void registerHashesPasswordAndReturnsToken() {
        when(users.existsByEmailIgnoreCase("a@b.com")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(i -> { User u = i.getArgument(0); u.setId(7L); return u; });

        AuthResponse res = service.register(new RegisterRequest("Ann", "A@B.com", "Secret123"));

        ArgumentCaptor<User> c = ArgumentCaptor.forClass(User.class);
        verify(users).save(c.capture());
        assertNotEquals("Secret123", c.getValue().getPasswordHash());
        assertTrue(encoder.matches("Secret123", c.getValue().getPasswordHash()));
        assertEquals("a@b.com", c.getValue().getEmail());
        assertNotNull(res.token());
        assertEquals(7L, res.user().id());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(users.existsByEmailIgnoreCase("a@b.com")).thenReturn(true);
        ApiException e = assertThrows(ApiException.class, () -> service.register(new RegisterRequest("Ann", "a@b.com", "Secret123")));
        assertEquals(HttpStatus.CONFLICT, e.getStatus());
        verify(users, never()).save(any());
    }

    @Test
    void loginFailsWithWrongPassword() {
        User u = new User(); u.setId(1L); u.setEmail("a@b.com"); u.setName("Ann"); u.setPasswordHash(encoder.encode("Right1234"));
        when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(u));
        ApiException e = assertThrows(ApiException.class, () -> service.login(new LoginRequest("a@b.com", "Wrong1234")));
        assertEquals(HttpStatus.UNAUTHORIZED, e.getStatus());
    }

    @Test
    void loginSucceedsWithCorrectPassword() {
        User u = new User(); u.setId(1L); u.setEmail("a@b.com"); u.setName("Ann"); u.setPasswordHash(encoder.encode("Right1234"));
        when(users.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(u));
        assertNotNull(service.login(new LoginRequest("a@b.com", "Right1234")).token());
    }
}
