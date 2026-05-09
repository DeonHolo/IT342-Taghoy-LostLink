package edu.cit.taghoy.lostlink.platform.security;

import edu.cit.taghoy.lostlink.feature.user.model.User;
import edu.cit.taghoy.lostlink.feature.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try finding by email first, as standard, then try studentId fallback
        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentId(username);
        }

        User user = userOpt.orElseThrow(() -> new UsernameNotFoundException("User not found with email/id: " + username));
        
        return new CustomUserDetails(user);
    }
}
