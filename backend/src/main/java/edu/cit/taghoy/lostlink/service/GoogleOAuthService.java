package edu.cit.taghoy.lostlink.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import edu.cit.taghoy.lostlink.model.Role;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.repository.RoleRepository;
import edu.cit.taghoy.lostlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String googleClientId;

    public GoogleOAuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${lostlink.google.oauth.client-id:}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleClientId = googleClientId;
    }

    public Optional<User> authenticateWithGoogleIdToken(String idTokenString)
            throws GeneralSecurityException, IOException {

        if (!StringUtils.hasText(googleClientId)) {
            return Optional.empty();
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        ).setAudience(Collections.singletonList(googleClientId)).build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            return Optional.empty();
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            return Optional.empty();
        }

        String sub = payload.getSubject();
        String email = payload.getEmail();
        if (!StringUtils.hasText(sub) || !StringUtils.hasText(email)) {
            return Optional.empty();
        }

        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");
        if (!StringUtils.hasText(firstName) && StringUtils.hasText((String) payload.get("name"))) {
            String full = (String) payload.get("name");
            int space = full.indexOf(' ');
            if (space > 0) {
                firstName = full.substring(0, space).trim();
                lastName = full.substring(space + 1).trim();
            } else {
                firstName = full.trim();
            }
        }
        if (!StringUtils.hasText(firstName)) {
            firstName = email.contains("@") ? email.substring(0, email.indexOf('@')) : "User";
        }
        if (!StringUtils.hasText(lastName)) {
            lastName = "-";
        }

        Optional<User> bySub = userRepository.findByGoogleSub(sub);
        if (bySub.isPresent()) {
            return bySub;
        }

        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            u.setGoogleSub(sub);
            return Optional.of(userRepository.save(u));
        }

        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new IllegalStateException("Default USER role not found."));

        User user = new User();
        user.setStudentId(null);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setGoogleSub(sub);
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(userRole);

        return Optional.of(userRepository.save(user));
    }
}
