package edu.cit.taghoy.lostlink.controller;

import edu.cit.taghoy.lostlink.dto.ApiResponse;
import edu.cit.taghoy.lostlink.dto.ItemDTO;
import edu.cit.taghoy.lostlink.dto.ProfileUpdateRequest;
import edu.cit.taghoy.lostlink.dto.UserDTO;
import edu.cit.taghoy.lostlink.model.Item;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.repository.ItemRepository;
import edu.cit.taghoy.lostlink.repository.UserRepository;
import edu.cit.taghoy.lostlink.security.CustomUserDetails;
import edu.cit.taghoy.lostlink.util.ContactPreferenceCodec;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          ItemRepository itemRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Object>> getProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Object>> updateProfile(@RequestBody ProfileUpdateRequest request) {
        User user = getCurrentUser();

        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (request.getStudentId() != null) {
            user.setStudentId(request.getStudentId());
        }
        if (request.getContactPlatform() != null || request.getContactDetails() != null) {
            user.setContactPreference(ContactPreferenceCodec.encode(
                    request.getContactPlatform(), request.getContactDetails()));
        } else if (request.getContactPreference() != null) {
            String cp = request.getContactPreference();
            user.setContactPreference(StringUtils.hasText(cp) ? cp : null);
        }

        if (StringUtils.hasText(request.getNewPassword())) {
            if (!StringUtils.hasText(request.getCurrentPassword())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("PROFILE-001", "Current password required",
                                "Please enter your current password to set a new one."));
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("PROFILE-002", "Incorrect current password",
                                "The current password you entered does not match."));
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user)));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<Object>> getActivity() {
        User user = getCurrentUser();
        List<Item> items = itemRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        List<ItemDTO> dtos = items.stream().map(ItemDTO::fromEntity).toList();

        Map<String, Object> activity = Map.of(
                "totalPosts", dtos.size(),
                "lostCount", dtos.stream().filter(i -> "LOST".equalsIgnoreCase(i.getStatus())).count(),
                "foundCount", dtos.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getStatus())).count(),
                "recentPosts", dtos.stream().limit(5).toList()
        );

        return ResponseEntity.ok(ApiResponse.ok(activity));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((CustomUserDetails) auth.getPrincipal()).getUser();
    }
}
