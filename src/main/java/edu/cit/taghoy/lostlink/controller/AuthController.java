package edu.cit.taghoy.lostlink.controller;

import edu.cit.taghoy.lostlink.dto.ApiResponse;
import edu.cit.taghoy.lostlink.dto.LoginRequest;
import edu.cit.taghoy.lostlink.dto.RegisterRequest;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);

            Map<String, Object> userData = buildUserMap(user);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("user", userData);
            data.put("accessToken", "phase1-placeholder-token");

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("DB-002", "Duplicate entry", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = authService.login(request);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            Map<String, Object> userData = buildUserMap(user);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("user", userData);
            data.put("accessToken", "phase1-placeholder-token");

            return ResponseEntity.ok(ApiResponse.ok(data));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("AUTH-001", "Invalid credentials",
                        "Student ID, Email, or password is incorrect."));
    }

    // ── Helper ──

    private Map<String, Object> buildUserMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("studentId", user.getStudentId());
        map.put("email", user.getEmail());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("role", user.getRole());
        return map;
    }
}
