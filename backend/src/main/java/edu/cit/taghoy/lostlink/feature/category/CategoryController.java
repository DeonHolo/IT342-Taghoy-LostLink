package edu.cit.taghoy.lostlink.feature.category;

import edu.cit.taghoy.lostlink.shared.api.ApiResponse;
import edu.cit.taghoy.lostlink.feature.category.model.Category;
import edu.cit.taghoy.lostlink.feature.category.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * GET /api/categories
     * Public endpoint — returns all hardcoded categories for dropdown population.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }
}
