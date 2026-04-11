package edu.cit.taghoy.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Type-safe DTO for the authentication response data payload.
 *
 * <p><b>Design Pattern: Builder (Creational)</b></p>
 * <p>Uses the Builder pattern (via Lombok @Builder) to construct the auth response
 * payload in a fluent, readable way. This replaces the previous approach of manually
 * assembling {@code LinkedHashMap<String, Object>} instances in the controller,
 * providing compile-time type safety and self-documenting code.</p>
 *
 * <p>Serialized JSON structure:</p>
 * <pre>
 * {
 *   "user": { "studentId": "...", "email": "...", ... },
 *   "accessToken": "..."
 * }
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseData {

    private UserDTO user;
    private String accessToken;
}
