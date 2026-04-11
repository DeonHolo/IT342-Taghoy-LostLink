package edu.cit.taghoy.lostlink.service;

import edu.cit.taghoy.lostlink.dto.ItemDTO;
import edu.cit.taghoy.lostlink.dto.ItemRequest;
import edu.cit.taghoy.lostlink.util.ContactPreferenceCodec;
import edu.cit.taghoy.lostlink.model.Category;
import edu.cit.taghoy.lostlink.model.Claim;
import edu.cit.taghoy.lostlink.model.Item;
import edu.cit.taghoy.lostlink.model.User;
import edu.cit.taghoy.lostlink.repository.CategoryRepository;
import edu.cit.taghoy.lostlink.repository.ClaimRepository;
import edu.cit.taghoy.lostlink.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final ClaimRepository claimRepository;

    private static final String UPLOAD_DIR = "uploads/";

    public ItemService(ItemRepository itemRepository, CategoryRepository categoryRepository, ClaimRepository claimRepository) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.claimRepository = claimRepository;
    }

    /**
     * Get all active items for the public feed.
     * Sensitive info is always hidden in the feed view.
     */
    public List<ItemDTO> getAllActiveItems() {
        return itemRepository.findAllActive().stream()
                .map(item -> ItemDTO.fromEntity(item, true))
                .collect(Collectors.toList());
    }

    /**
     * Search items by keyword across title, description, and AI tags.
     */
    public List<ItemDTO> searchItems(String keyword, String status) {
        List<Item> items;
        if (status != null && !status.isBlank()) {
            items = itemRepository.searchByKeywordAndStatus(keyword, status);
        } else {
            items = itemRepository.searchByKeyword(keyword);
        }
        return items.stream()
                .map(item -> ItemDTO.fromEntity(item, true))
                .collect(Collectors.toList());
    }

    /**
     * Filter items by status only.
     */
    public List<ItemDTO> getItemsByStatus(String status) {
        return itemRepository.findAllActiveByStatus(status).stream()
                .map(item -> ItemDTO.fromEntity(item, true))
                .collect(Collectors.toList());
    }

    /**
     * Filter items by category.
     */
    public List<ItemDTO> getItemsByCategory(Long categoryId) {
        return itemRepository.findAllActiveByCategoryId(categoryId).stream()
                .map(item -> ItemDTO.fromEntity(item, true))
                .collect(Collectors.toList());
    }

    /**
     * Get a single item's details.
     * Sensitive info is hidden unless the user has already revealed it.
     */
    public ItemDTO getItemById(Long id, User currentUser) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found."));

        boolean hideSensitive = true;

        // If the viewer is the poster, show their own info
        if (currentUser != null && item.getUser().getId().equals(currentUser.getId())) {
            hideSensitive = false;
        }

        // If the viewer has already revealed this item, show info
        if (currentUser != null && claimRepository.existsByItemIdAndUserId(id, currentUser.getId())) {
            hideSensitive = false;
        }

        return ItemDTO.fromEntity(item, hideSensitive);
    }

    /**
     * Create a new item post.
     */
    public Item createItem(ItemRequest request, User user) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));

        validateHoldingContact(request);

        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setStatus(request.getStatus().toUpperCase());
        item.setCurrentStatus(request.getCurrentStatus());
        item.setLocation(request.getLocation());
        item.setDropoffLocation(request.getDropoffLocation());
        item.setContactPreference(resolveContactPreference(request));
        item.setCategory(category);
        item.setUser(user);

        return itemRepository.save(item);
    }

    /**
     * Update an existing item (only the owner can do this).
     */
    public Item updateItem(Long id, ItemRequest request, User user) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found."));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You can only edit your own posts.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));

        validateHoldingContact(request);

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setStatus(request.getStatus().toUpperCase());
        item.setCurrentStatus(request.getCurrentStatus());
        item.setLocation(request.getLocation());
        item.setDropoffLocation(request.getDropoffLocation());
        item.setContactPreference(resolveContactPreference(request));
        item.setCategory(category);

        return itemRepository.save(item);
    }

    private static void validateHoldingContact(ItemRequest request) {
        if (request.getCurrentStatus() == null
                || !"HOLDING".equalsIgnoreCase(request.getCurrentStatus())) {
            return;
        }
        if (!StringUtils.hasText(resolveContactPreference(request))) {
            throw new IllegalArgumentException(
                    "Contact platform and details are required when holding an item.");
        }
    }

    private static String resolveContactPreference(ItemRequest request) {
        if (StringUtils.hasText(request.getContactPlatform())
                || StringUtils.hasText(request.getContactDetails())) {
            return ContactPreferenceCodec.encode(
                    request.getContactPlatform(), request.getContactDetails());
        }
        if (StringUtils.hasText(request.getContactPreference())) {
            return request.getContactPreference().trim();
        }
        return null;
    }

    /**
     * Delete an item (only the owner can do this).
     */
    public void deleteItem(Long id, User user) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found."));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You can only delete your own posts.");
        }

        itemRepository.delete(item);
    }

    /**
     * Upload an image for an item.
     * Stores the file locally and updates the item's imageUrl field.
     */
    public String uploadImage(Long itemId, MultipartFile file, User user) throws IOException {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found."));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You can only upload images for your own posts.");
        }

        // Validate file type (JPEG, PNG only per SDD security requirements)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Only JPEG and PNG images are accepted.");
        }

        // Validate file size (5MB max per SDD)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Image must be smaller than 5MB.");
        }

        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String extension = contentType.equals("image/png") ? ".png" : ".jpg";
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/" + filename;
        item.setImageUrl(imageUrl);
        itemRepository.save(item);

        return imageUrl;
    }

    /**
     * Reveal contact info / dropoff location for an item.
     * Logs the action in the claims audit trail.
     */
    public ItemDTO revealItemDetails(Long itemId, User user) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found."));

        // Check if already revealed
        if (!claimRepository.existsByItemIdAndUserId(itemId, user.getId())) {
            Claim claim = new Claim();
            claim.setItem(item);
            claim.setUser(user);
            claimRepository.save(claim);
        }

        // Return item with sensitive info visible
        return ItemDTO.fromEntity(item, false);
    }

    /**
     * Get items posted by a specific user.
     */
    public List<ItemDTO> getItemsByUser(User user) {
        return itemRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(item -> ItemDTO.fromEntity(item, false))
                .collect(Collectors.toList());
    }
}
