package edu.cit.taghoy.lostlink.controller;

import edu.cit.taghoy.lostlink.dto.ApiResponse;
import edu.cit.taghoy.lostlink.dto.AuthResponseData;
import edu.cit.taghoy.lostlink.dto.LoginRequest;
import edu.cit.taghoy.lostlink.dto.RegisterRequest;
import edu.cit.taghoy.lostlink.dto.UserDTO;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST controller for authentication endpoints.
 *
 * <p><b>Design Pattern: Builder (Creational)</b></p>
 * <p>This controller was refactored to use {@link UserDTO} and {@link AuthResponseData},
 * both of which leverage the Builder pattern (via Lombok {@code @Builder}). Previously,
 * the controller manually assembled {@code LinkedHashMap<String, Object>} instances to
 * construct response payloads — a brittle, non-type-safe approach. The Builder pattern
 * provides fluent, readable, and compile-time-safe object construction.</p>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     *
     * Registers a new user account and returns the user data with an access token.
     * Uses the Builder pattern to construct the response payload via
     * {@link UserDTO#fromEntity(User)} and {@link AuthResponseData#builder()}.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);

            // Builder pattern: fluent, type-safe response construction
            AuthResponseData data = AuthResponseData.builder()
                    .user(UserDTO.fromEntity(user))
                    .accessToken("phase1-placeholder-token")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("DB-002", "Duplicate entry", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     *
     * Authenticates a user and returns user data with an access token.
     * Uses the Builder pattern to construct the response payload.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = authService.login(request);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Builder pattern: fluent, type-safe response construction
            AuthResponseData data = AuthResponseData.builder()
                    .user(UserDTO.fromEntity(user))
                    .accessToken("phase1-placeholder-token")
                    .build();

            return ResponseEntity.ok(ApiResponse.ok(data));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("AUTH-001", "Invalid credentials",
                        "Student ID, Email, or password is incorrect."));
    }
}
