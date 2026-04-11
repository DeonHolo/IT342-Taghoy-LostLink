package edu.cit.taghoy.lostlink.config;

import edu.cit.taghoy.lostlink.model.Category;
import edu.cit.taghoy.lostlink.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Seeds the database with hardcoded categories on startup if none exist.
 */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                List<Category> categories = List.of(
                    new Category(null, "Electronics"),
                    new Category(null, "Documents & IDs"),
                    new Category(null, "School Supplies"),
                    new Category(null, "Personal Items"),
                    new Category(null, "Clothing & Accessories"),
                    new Category(null, "Keys & Keychains"),
                    new Category(null, "Bags & Wallets"),
                    new Category(null, "Others")
                );
                categoryRepository.saveAll(categories);
                System.out.println("✓ Seeded " + categories.size() + " default categories.");
            }
        };
    }
}
