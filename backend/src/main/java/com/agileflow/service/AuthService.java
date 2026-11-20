package com.agileflow.service;

import com.agileflow.dto.Dtos.*;
import com.agileflow.entity.User;
import com.agileflow.exception.ApiException;
import com.agileflow.repository.UserRepository;
import com.agileflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    @Transactional
    public AuthResponse register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw ApiException.conflict("Email is already registered");
        User u = new User();
        u.setName(r.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        u = users.save(u);
        return new AuthResponse(jwt.generate(u), toDto(u));
    }

    @Transactional
    public AuthResponse login(LoginRequest r) {
        User u = users.findByEmailIgnoreCase(r.email().trim())
                .filter(x -> encoder.matches(r.password(), x.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        return new AuthResponse(jwt.generate(u), toDto(u));
    }

    @Transactional
    public UserDto me(Long id) { return toDto(find(id)); }

    @Transactional
    public UserDto updateProfile(Long id, ProfileRequest r) {
        User u = find(id);
        u.setName(r.name().trim());
        if (r.newPassword() != null && !r.newPassword().isBlank()) {
            if (r.currentPassword() == null || !encoder.matches(r.currentPassword(), u.getPasswordHash()))
                throw ApiException.badRequest("Current password is incorrect");
            u.setPasswordHash(encoder.encode(r.newPassword()));
        }
        return toDto(users.save(u));
    }

    private User find(Long id) { return users.findById(id).orElseThrow(() -> ApiException.unauthorized("User no longer exists")); }
    private UserDto toDto(User u) { return new UserDto(u.getId(), u.getName(), u.getEmail()); }
}
