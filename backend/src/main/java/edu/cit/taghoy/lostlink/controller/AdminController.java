package edu.cit.taghoy.lostlink.controller;

import edu.cit.taghoy.lostlink.dto.ApiResponse;
import edu.cit.taghoy.lostlink.dto.ItemDTO;
import edu.cit.taghoy.lostlink.dto.UserDTO;
import edu.cit.taghoy.lostlink.model.Item;
import edu.cit.taghoy.lostlink.model.Role;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.repository.ItemRepository;
import edu.cit.taghoy.lostlink.repository.RoleRepository;
import edu.cit.taghoy.lostlink.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final RoleRepository roleRepository;

    public AdminController(UserRepository userRepository,
                           ItemRepository itemRepository,
                           RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Object>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Object>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {

        String roleName = body.get("roleName");
        if (roleName == null || roleName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("ADMIN-001", "Missing roleName", "Provide a valid roleName in the body."));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-002", "User not found", "No user exists with id " + userId));
        }

        Optional<Role> roleOpt = roleRepository.findByRoleName(roleName.toUpperCase());
        if (roleOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("ADMIN-003", "Invalid role", "Role '" + roleName + "' does not exist."));
        }

        User user = userOpt.get();
        user.setRole(roleOpt.get());
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Object>> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-002", "User not found", "No user exists with id " + userId));
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "User deleted successfully.")));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<Object>> getAllItems() {
        List<ItemDTO> items = itemRepository.findAll().stream()
                .map(ItemDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Object>> deleteItem(@PathVariable Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-004", "Item not found", "No item exists with id " + itemId));
        }
        itemRepository.deleteById(itemId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Item removed successfully.")));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalItems = itemRepository.count();
        List<Item> allItems = itemRepository.findAll();
        long lostCount = allItems.stream().filter(i -> "LOST".equalsIgnoreCase(i.getStatus())).count();
        long foundCount = allItems.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getStatus())).count();

        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "totalItems", totalItems,
                "lostCount", lostCount,
                "foundCount", foundCount
        );

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
