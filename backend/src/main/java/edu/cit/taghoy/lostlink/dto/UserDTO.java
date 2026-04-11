package edu.cit.taghoy.lostlink.dto;

import edu.cit.taghoy.lostlink.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Type-safe DTO for serializing User entity data in API responses.
 *
 * <p><b>Design Pattern: Builder (Creational)</b></p>
 * <p>Uses the Builder pattern (via Lombok @Builder) to construct UserDTO instances
 * in a readable, fluent manner instead of relying on telescoping constructors.
 * The static factory method {@link #fromEntity(User)} provides a convenient
 * entry point that leverages the Builder internally.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private String studentId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;

    /**
     * Factory method that uses the Builder to construct a UserDTO from a JPA User entity.
     *
     * @param user the JPA User entity
     * @return a fully populated UserDTO
     */
    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .studentId(user.getStudentId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}
