package edu.cit.taghoy.lostlink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for creating/updating items.
 * Validates required fields per the SDD.
 */
@Data
public class ItemRequest {

    @NotBlank(message = "Title is required.")
    private String title;

    private String description;

    @NotBlank(message = "Status is required (LOST or FOUND).")
    private String status;

    /** HOLDING or SURRENDERED */
    private String currentStatus;

    @NotBlank(message = "Location is required.")
    private String location;

    /** Required if currentStatus is SURRENDERED */
    private String dropoffLocation;

    /** Required if currentStatus is HOLDING (legacy or combined with platform/details). */
    private String contactPreference;

    private String contactPlatform;
    private String contactDetails;

    @NotNull(message = "Category is required.")
    private Long categoryId;
}
