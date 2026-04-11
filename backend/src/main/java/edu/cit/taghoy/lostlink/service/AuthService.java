package edu.cit.taghoy.lostlink.service;

import edu.cit.taghoy.lostlink.dto.LoginRequest;
import edu.cit.taghoy.lostlink.dto.RegisterRequest;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user.
     * Validates duplicate email/studentId and hashes the password with BCrypt.
     */
    public User register(RegisterRequest request) {
        // The unique constraints on the DB side will automatically throw DataIntegrityViolationException 
        // if a duplicate email or student ID is registered, which our GlobalExceptionHandler will catch.

        User user = new User();
        user.setStudentId(request.getStudentId());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        return userRepository.save(user);
    }

    /**
     * Login by identifier (Student ID or Email) and password.
     * Returns the user if credentials are valid, empty otherwise.
     */
    public Optional<User> login(LoginRequest request) {
        // Try finding by email first, then by student ID
        Optional<User> userOpt = userRepository.findByEmail(request.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentId(request.getIdentifier());
        }

        // Verify password
        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return userOpt;
        }

        return Optional.empty();
    }
}
