package edu.cit.taghoy.lostlink.feature.user.dto;

import edu.cit.taghoy.lostlink.feature.user.model.User;
import edu.cit.taghoy.lostlink.shared.util.ContactPreferenceCodec;
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

    private Long id;
    private String studentId;
    private String email;
    private String firstName;
    private String lastName;
    /** Encoded storage (platform|||details); kept for backward compatibility. */
    private String contactPreference;
    private String contactPlatform;
    private String contactDetails;
    private String role;
    private boolean suspended;

    public static UserDTO fromEntity(User user) {
        String[] parts = ContactPreferenceCodec.decode(user.getContactPreference());
        return UserDTO.builder()
                .id(user.getId())
                .studentId(user.getStudentId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .contactPreference(user.getContactPreference())
                .contactPlatform(parts[0])
                .contactDetails(parts[1])
                .role(user.getRoleName())
                .suspended(user.isSuspended())
                .build();
    }
}
