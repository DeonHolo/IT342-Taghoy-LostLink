package edu.cit.taghoy.lostlink.feature.user.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String studentId;
    /** Legacy single field; ignored if contactPlatform / contactDetails are sent. */
    private String contactPreference;
    private String contactPlatform;
    private String contactDetails;
    private String currentPassword;
    private String newPassword;
}
