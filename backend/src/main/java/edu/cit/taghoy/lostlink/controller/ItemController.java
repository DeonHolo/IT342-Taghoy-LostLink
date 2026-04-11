package edu.cit.taghoy.lostlink.controller;

import edu.cit.taghoy.lostlink.dto.ApiResponse;
import edu.cit.taghoy.lostlink.dto.ItemDTO;
import edu.cit.taghoy.lostlink.dto.ItemRequest;
import edu.cit.taghoy.lostlink.model.Item;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.security.CustomUserDetails;
import edu.cit.taghoy.lostlink.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    /**
     * GET /api/items — Public feed of all active items.
     * Supports optional query params: ?search=keyword&status=LOST|FOUND&categoryId=1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        List<ItemDTO> items;

        if (search != null && !search.isBlank()) {
            items = itemService.searchItems(search, status);
        } else if (status != null && !status.isBlank()) {
            items = itemService.getItemsByStatus(status);
        } else if (categoryId != null) {
            items = itemService.getItemsByCategory(categoryId);
        } else if (dateFrom != null || dateTo != null) {
            items = itemService.getItemsByDateRange(dateFrom, dateTo);
        } else {
            items = itemService.getAllActiveItems();
        }

        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    /**
     * GET /api/items/search — SDD-shaped alias for the main feed with search.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Object>> searchItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        return getAllItems(search, status, categoryId, dateFrom, dateTo);
    }

    /**
     * GET /api/items/{id} — Get single item details.
     * Contact info is hidden unless the user has revealed it.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getItemById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        try {
            ItemDTO item = itemService.getItemById(id, currentUser);
            return ResponseEntity.ok(ApiResponse.ok(item));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", "Resource not found", e.getMessage()));
        }
    }

    /**
     * POST /api/items — Create a new item report.
     * Requires authentication.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createItem(@Valid @RequestBody ItemRequest request) {
        User user = requireCurrentUser();

        try {
            Item item = itemService.createItem(request, user);
            ItemDTO dto = ItemDTO.fromEntity(item, false);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(dto));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Account suspended", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("VALID-001", "Validation failed", e.getMessage()));
        }
    }

    /**
     * PUT /api/items/{id} — Update own item.
     * Requires authentication and ownership.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request
    ) {
        User user = requireCurrentUser();
        try {
            Item item = itemService.updateItem(id, request, user);
            ItemDTO dto = ItemDTO.fromEntity(item, false);
            return ResponseEntity.ok(ApiResponse.ok(dto));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Insufficient permissions", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", "Resource not found", e.getMessage()));
        }
    }

    /**
     * DELETE /api/items/{id} — Delete own item.
     * Requires authentication and ownership.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteItem(@PathVariable Long id) {
        User user = requireCurrentUser();
        try {
            itemService.deleteItem(id, user);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Item successfully deleted.")));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Insufficient permissions", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", "Resource not found", e.getMessage()));
        }
    }

    /**
     * POST /api/items/{id}/upload-image — Upload image for an item.
     * Requires authentication and ownership.
     */
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<ApiResponse<Object>> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile file
    ) {
        User user = requireCurrentUser();
        try {
            String imageUrl = itemService.uploadImage(id, file, user);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("imageUrl", imageUrl)));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Insufficient permissions", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("VALID-001", "Validation failed", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("SYSTEM-001", "File upload failed", e.getMessage()));
        }
    }

    /**
     * POST /api/items/{id}/reveal — Reveal hidden contact info.
     * Logs the action in the claims audit trail.
     * Requires authentication.
     */
    @PostMapping("/{id}/reveal")
    public ResponseEntity<ApiResponse<Object>> revealItemDetails(@PathVariable Long id) {
        User user = requireCurrentUser();
        try {
            ItemDTO item = itemService.revealItemDetails(id, user);
            return ResponseEntity.ok(ApiResponse.ok(item));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Account suspended", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", "Resource not found", e.getMessage()));
        }
    }

    /**
     * PUT /api/items/{id}/resolve — Owner toggles resolved status.
     * Requires authentication and ownership.
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<Object>> toggleResolve(@PathVariable Long id) {
        User user = requireCurrentUser();
        try {
            Item item = itemService.toggleResolve(id, user);
            ItemDTO dto = ItemDTO.fromEntity(item, false);
            return ResponseEntity.ok(ApiResponse.ok(dto));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Insufficient permissions", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", "Resource not found", e.getMessage()));
        }
    }

    /**
     * GET /api/items/my-posts — Get items posted by the current user.
     * Requires authentication.
     */
    @GetMapping("/my-posts")
    public ResponseEntity<ApiResponse<Object>> getMyPosts() {
        User user = requireCurrentUser();
        List<ItemDTO> items = itemService.getItemsByUser(user);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    // ── Helper methods ──

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getUser();
        }
        return null;
    }

    private User requireCurrentUser() {
        User user = getCurrentUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }
        return user;
    }
}
