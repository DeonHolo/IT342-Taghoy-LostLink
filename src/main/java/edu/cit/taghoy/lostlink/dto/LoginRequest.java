package edu.cit.taghoy.lostlink.dto;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Identifier (Student ID or Email) is required.")
    private String identifier;

    @NotBlank(message = "Password is required.")
    private String password;
}
