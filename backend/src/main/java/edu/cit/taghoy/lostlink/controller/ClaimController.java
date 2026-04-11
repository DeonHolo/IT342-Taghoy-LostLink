package edu.cit.taghoy.lostlink.controller;

import edu.cit.taghoy.lostlink.dto.ApiResponse;
import edu.cit.taghoy.lostlink.dto.ItemDTO;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.security.CustomUserDetails;
import edu.cit.taghoy.lostlink.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SDD-shaped alias: POST /api/claims { itemId }
 * Delegates to the same reveal logic used by POST /api/items/{id}/reveal.
 */
@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ItemService itemService;

    public ClaimController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createClaim(@RequestBody Map<String, Object> body) {
        User user = requireCurrentUser();

        Object raw = body.get("itemId");
        if (raw == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALID-001", "Missing itemId", "Provide itemId in the request body."));
        }

        Long itemId;
        try {
            itemId = Long.valueOf(raw.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALID-001", "Invalid itemId", "itemId must be a number."));
        }

        try {
            ItemDTO item = itemService.revealItemDetails(itemId, user);
            return ResponseEntity.ok(ApiResponse.ok(item));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AUTH-003", "Account suspended", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("DB-001", "Resource not found", e.getMessage()));
        }
    }

    private User requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getUser();
        }
        throw new SecurityException("Authentication required.");
    }
}
