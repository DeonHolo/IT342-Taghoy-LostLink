package edu.cit.taghoy.lostlink.service;

import edu.cit.taghoy.lostlink.dto.LoginRequest;
import edu.cit.taghoy.lostlink.dto.RegisterRequest;
import edu.cit.taghoy.lostlink.model.Role;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.repository.RoleRepository;
import edu.cit.taghoy.lostlink.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
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

        return userRepository.save(user);
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
