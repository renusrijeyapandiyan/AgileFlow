package com.agileflow.security;

/** Authenticated principal extracted from a valid JWT. */
public record AuthUser(Long id, String email) {}
