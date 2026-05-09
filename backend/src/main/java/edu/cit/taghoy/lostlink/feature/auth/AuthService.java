package edu.cit.taghoy.lostlink.feature.auth;

import edu.cit.taghoy.lostlink.feature.auth.dto.LoginRequest;
import edu.cit.taghoy.lostlink.feature.auth.dto.RegisterRequest;
import edu.cit.taghoy.lostlink.feature.user.model.Role;
import edu.cit.taghoy.lostlink.feature.user.model.User;
import edu.cit.taghoy.lostlink.feature.user.repository.RoleRepository;
import edu.cit.taghoy.lostlink.feature.user.repository.UserRepository;
import edu.cit.taghoy.lostlink.integration.email.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User register(RegisterRequest request) {
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new IllegalStateException("Default USER role not found. Run DataSeeder."));

        User user = new User();
        user.setStudentId(request.getStudentId());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);

        User saved = userRepository.save(user);
        emailService.sendWelcome(saved.getEmail(), saved.getFirstName());
        return saved;
    }

    public Optional<User> login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentId(request.getIdentifier());
        }

        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return userOpt;
        }

        return Optional.empty();
    }
}
