package edu.cit.taghoy.lostlink.feature.auth;

import edu.cit.taghoy.lostlink.shared.api.ApiResponse;
import edu.cit.taghoy.lostlink.feature.auth.dto.AuthResponseData;
import edu.cit.taghoy.lostlink.feature.auth.dto.GoogleTokenRequest;
import edu.cit.taghoy.lostlink.feature.auth.dto.LoginRequest;
import edu.cit.taghoy.lostlink.feature.auth.dto.RegisterRequest;
import edu.cit.taghoy.lostlink.feature.user.dto.UserDTO;
import edu.cit.taghoy.lostlink.feature.user.model.User;
import edu.cit.taghoy.lostlink.platform.security.CustomUserDetails;
import edu.cit.taghoy.lostlink.platform.security.JwtService;
import edu.cit.taghoy.lostlink.feature.auth.AuthService;
import edu.cit.taghoy.lostlink.feature.auth.GoogleOAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
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
    private final JwtService jwtService;
    private final GoogleOAuthService googleOAuthService;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            GoogleOAuthService googleOAuthService
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.googleOAuthService = googleOAuthService;
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
        // Validation for duplicate entries is now handled globally via DataIntegrityViolationException
        User user = authService.register(request);

        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));

        // Builder pattern: fluent, type-safe response construction
        AuthResponseData data = AuthResponseData.builder()
                .user(UserDTO.fromEntity(user))
                .accessToken(jwtToken)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));
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
            String jwtToken = jwtService.generateToken(new CustomUserDetails(user));

            // Builder pattern: fluent, type-safe response construction
            AuthResponseData data = AuthResponseData.builder()
                    .user(UserDTO.fromEntity(user))
                    .accessToken(jwtToken)
                    .build();

            return ResponseEntity.ok(ApiResponse.ok(data));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("AUTH-001", "Invalid credentials",
                        "Student ID, Email, or password is incorrect."));
    }

    /**
     * POST /api/auth/google
     *
     * Accepts a Google ID token from the client (GIS), verifies it with Google,
     * links or creates a user, and returns the same payload as email/password login.
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<Object>> googleLogin(@Valid @RequestBody GoogleTokenRequest request) {
        try {
            Optional<User> userOpt = googleOAuthService.authenticateWithGoogleIdToken(request.getToken());

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("AUTH-002", "Google sign-in failed",
                                "Invalid token, unverified email, or OAuth is not configured."));
            }

            User user = userOpt.get();
            String jwtToken = jwtService.generateToken(new CustomUserDetails(user));

            AuthResponseData data = AuthResponseData.builder()
                    .user(UserDTO.fromEntity(user))
                    .accessToken(jwtToken)
                    .build();

            return ResponseEntity.ok(ApiResponse.ok(data));
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("AUTH-002", "Google sign-in failed",
                            "Could not verify token with Google."));
        }
    }

    /**
     * GET /api/auth/me
     *
     * Returns the profile of the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser() {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            User user = ((CustomUserDetails) auth.getPrincipal()).getUser();
            return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user)));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("AUTH-001", "Not authenticated", "No valid session found."));
    }

    /**
     * POST /api/auth/logout
     *
     * Client-side logout — instructs the client to discard the token.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(ApiResponse.ok(java.util.Map.of("message", "Successfully logged out.")));
    }
}
