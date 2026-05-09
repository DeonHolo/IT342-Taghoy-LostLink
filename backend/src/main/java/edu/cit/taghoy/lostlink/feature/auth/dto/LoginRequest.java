package edu.cit.taghoy.lostlink.feature.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Identifier (Student ID or Email) is required.")
    private String identifier;

    @NotBlank(message = "Password is required.")
    private String password;
}
