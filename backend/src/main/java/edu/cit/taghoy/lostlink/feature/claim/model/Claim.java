package edu.cit.taghoy.lostlink.feature.claim.model;

import edu.cit.taghoy.lostlink.feature.item.model.Item;
import edu.cit.taghoy.lostlink.feature.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "revealed_at", updatable = false)
    private LocalDateTime revealedAt;

    @PrePersist
    protected void onCreate() {
        this.revealedAt = LocalDateTime.now();
    }
}
