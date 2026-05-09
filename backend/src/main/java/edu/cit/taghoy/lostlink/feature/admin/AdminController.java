package edu.cit.taghoy.lostlink.feature.admin;

import edu.cit.taghoy.lostlink.shared.api.ApiResponse;
import edu.cit.taghoy.lostlink.feature.item.dto.ItemDTO;
import edu.cit.taghoy.lostlink.feature.user.dto.UserDTO;
import edu.cit.taghoy.lostlink.feature.category.model.Category;
import edu.cit.taghoy.lostlink.feature.claim.model.Claim;
import edu.cit.taghoy.lostlink.feature.item.model.Item;
import edu.cit.taghoy.lostlink.feature.user.model.Role;
import edu.cit.taghoy.lostlink.feature.user.model.User;
import edu.cit.taghoy.lostlink.feature.category.repository.CategoryRepository;
import edu.cit.taghoy.lostlink.feature.claim.repository.ClaimRepository;
import edu.cit.taghoy.lostlink.feature.item.repository.ItemRepository;
import edu.cit.taghoy.lostlink.feature.user.repository.RoleRepository;
import edu.cit.taghoy.lostlink.feature.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final RoleRepository roleRepository;
    private final ClaimRepository claimRepository;
    private final CategoryRepository categoryRepository;

    public AdminController(UserRepository userRepository,
                           ItemRepository itemRepository,
                           RoleRepository roleRepository,
                           ClaimRepository claimRepository,
                           CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.roleRepository = roleRepository;
        this.claimRepository = claimRepository;
        this.categoryRepository = categoryRepository;
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

    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<ApiResponse<Object>> toggleSuspend(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-002", "User not found", "No user exists with id " + userId));
        }
        User target = userOpt.get();
        target.setSuspended(!target.isSuspended());
        userRepository.save(target);
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(target)));
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

    @PutMapping("/items/{itemId}/resolve")
    public ResponseEntity<ApiResponse<Object>> resolveItem(@PathVariable Long itemId) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-004", "Item not found", "No item exists with id " + itemId));
        }
        Item item = itemOpt.get();
        String current = item.getStatus();
        if (!"RESOLVED".equalsIgnoreCase(current)) {
            if ("LOST".equalsIgnoreCase(current) || "FOUND".equalsIgnoreCase(current)) {
                item.setStatusBeforeResolve(current.toUpperCase());
            }
        }
        item.setStatus("RESOLVED");
        itemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.ok(ItemDTO.fromEntity(item)));
    }

    @PutMapping("/items/{itemId}/unresolve")
    public ResponseEntity<ApiResponse<Object>> unresolveItem(
            @PathVariable Long itemId,
            @RequestBody(required = false) Map<String, String> body) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-004", "Item not found", "No item exists with id " + itemId));
        }
        Item item = itemOpt.get();
        if (!"RESOLVED".equalsIgnoreCase(item.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("ADMIN-007", "Not resolved", "Only resolved items can be restored to the feed."));
        }
        String restore = body != null ? body.get("restoreStatus") : null;
        if (restore == null || restore.isBlank()) {
            restore = item.getStatusBeforeResolve();
        }
        if (restore == null || restore.isBlank()) {
            restore = "LOST";
        }
        restore = restore.trim().toUpperCase();
        if (!"LOST".equals(restore) && !"FOUND".equals(restore)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("ADMIN-008", "Invalid restoreStatus", "restoreStatus must be LOST or FOUND."));
        }
        item.setStatus(restore);
        item.setStatusBeforeResolve(null);
        itemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.ok(ItemDTO.fromEntity(item)));
    }

    @GetMapping("/claims")
    public ResponseEntity<ApiResponse<Object>> getAllClaims() {
        List<Claim> claims = claimRepository.findAll();
        List<Map<String, Object>> result = claims.stream().map(c -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", c.getId());
            row.put("itemId", c.getItem().getId());
            row.put("itemTitle", c.getItem().getTitle());
            row.put("userId", c.getUser().getId());
            row.put("userName", c.getUser().getFirstName() + " " + c.getUser().getLastName());
            row.put("userEmail", c.getUser().getEmail());
            row.put("revealedAt", c.getRevealedAt());
            return row;
        }).toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<Object>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Object>> createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("ADMIN-005", "Missing name", "Category name is required."));
        }
        Category cat = new Category(null, name.trim());
        categoryRepository.save(cat);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(cat));
    }

    @PutMapping("/categories/{catId}")
    public ResponseEntity<ApiResponse<Object>> updateCategory(
            @PathVariable Long catId,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("ADMIN-005", "Missing name", "Category name is required."));
        }
        Optional<Category> catOpt = categoryRepository.findById(catId);
        if (catOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-006", "Category not found", "No category with id " + catId));
        }
        Category cat = catOpt.get();
        cat.setName(name.trim());
        categoryRepository.save(cat);
        return ResponseEntity.ok(ApiResponse.ok(cat));
    }

    @DeleteMapping("/categories/{catId}")
    public ResponseEntity<ApiResponse<Object>> deleteCategory(@PathVariable Long catId) {
        if (!categoryRepository.existsById(catId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ADMIN-006", "Category not found", "No category with id " + catId));
        }
        categoryRepository.deleteById(catId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Category deleted.")));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalItems = itemRepository.count();
        List<Item> allItems = itemRepository.findAll();
        long lostCount = allItems.stream().filter(i -> "LOST".equalsIgnoreCase(i.getStatus())).count();
        long foundCount = allItems.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getStatus())).count();
        long resolvedCount = allItems.stream().filter(i -> "RESOLVED".equalsIgnoreCase(i.getStatus())).count();
        long claimsCount = claimRepository.count();
        long suspendedCount = userRepository.countBySuspendedTrue();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalItems", totalItems);
        stats.put("lostCount", lostCount);
        stats.put("foundCount", foundCount);
        stats.put("resolvedCount", resolvedCount);
        stats.put("claimsCount", claimsCount);
        stats.put("suspendedCount", suspendedCount);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
