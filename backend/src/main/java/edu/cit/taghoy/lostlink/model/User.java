package edu.cit.taghoy.lostlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", unique = true)
    private String studentId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "google_sub", unique = true, length = 255)
    private String googleSub;

    @Column(name = "contact_preference")
    private String contactPreference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Convenience accessor that returns the role name string (e.g. "USER", "ADMIN").
     * Used by security and DTO layers so they don't need to know about the Role entity.
     */
    public String getRoleName() {
        return role != null ? role.getRoleName() : "USER";
    }
}
