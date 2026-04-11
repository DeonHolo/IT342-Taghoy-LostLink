package edu.cit.taghoy.lostlink.dto;

import edu.cit.taghoy.lostlink.model.Item;
import edu.cit.taghoy.lostlink.util.ContactPreferenceCodec;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * DTO for Item responses in the API.
 * Converts the comma-separated aiTags string into a proper list for JSON serialization.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDTO {

    private Long id;
    private String title;
    private String description;
    private String status;
    /** LOST or FOUND saved when status became RESOLVED; null otherwise. */
    private String statusBeforeResolve;
    private String currentStatus;
    private String location;
    private String dropoffLocation;
    private String contactPreference;
    private String contactPlatform;
    private String contactDetails;
    private String imageUrl;
    private List<String> aiTags;
    private String categoryName;
    private Long categoryId;
    private String posterStudentId;
    private String posterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Factory method to construct an ItemDTO from a JPA Item entity.
     * Sensitive fields (contactPreference, dropoffLocation) can be nulled based on reveal status.
     */
    public static ItemDTO fromEntity(Item item) {
        return fromEntity(item, false);
    }

    public static ItemDTO fromEntity(Item item, boolean hideSensitiveInfo) {
        List<String> tagList = Collections.emptyList();
        if (item.getAiTags() != null && !item.getAiTags().isBlank()) {
            tagList = Arrays.asList(item.getAiTags().split(","));
        }

        String rawContact = hideSensitiveInfo ? null : item.getContactPreference();
        String[] contactParts = rawContact != null
                ? ContactPreferenceCodec.decode(rawContact)
                : new String[] { null, null };

        return ItemDTO.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .status(item.getStatus())
                .statusBeforeResolve(item.getStatusBeforeResolve())
                .currentStatus(item.getCurrentStatus())
                .location(item.getLocation())
                .dropoffLocation(hideSensitiveInfo ? null : item.getDropoffLocation())
                .contactPreference(rawContact)
                .contactPlatform(contactParts[0])
                .contactDetails(contactParts[1])
                .imageUrl(item.getImageUrl())
                .aiTags(tagList)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .posterStudentId(item.getUser() != null ? item.getUser().getStudentId() : null)
                .posterName(item.getUser() != null ? item.getUser().getFirstName() + " " + item.getUser().getLastName() : null)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
