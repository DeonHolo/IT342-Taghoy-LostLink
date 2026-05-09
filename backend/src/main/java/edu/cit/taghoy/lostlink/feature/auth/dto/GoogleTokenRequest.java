package edu.cit.taghoy.lostlink.feature.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleTokenRequest {

    @NotBlank(message = "Google ID token is required.")
    private String token;
}
