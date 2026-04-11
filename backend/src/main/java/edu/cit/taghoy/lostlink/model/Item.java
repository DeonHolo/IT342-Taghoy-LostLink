package edu.cit.taghoy.lostlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** LOST, FOUND, or RESOLVED */
    @Column(nullable = false)
    private String status;

    /** LOST or FOUND captured when an admin marks the item RESOLVED (used to restore). */
    @Column(name = "status_before_resolve")
    private String statusBeforeResolve;

    /** HOLDING or SURRENDERED */
    @Column(name = "current_status")
    private String currentStatus;

    @Column(nullable = false)
    private String location;

    @Column(name = "dropoff_location")
    private String dropoffLocation;

    @Column(name = "contact_preference")
    private String contactPreference;

    @Column(name = "image_url")
    private String imageUrl;

    /** Comma-separated AI-generated tags from Imagga */
    @Column(name = "ai_tags", columnDefinition = "TEXT")
    private String aiTags;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
