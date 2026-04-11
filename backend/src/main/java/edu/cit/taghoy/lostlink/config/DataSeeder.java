package edu.cit.taghoy.lostlink.config;

import edu.cit.taghoy.lostlink.model.Category;
import edu.cit.taghoy.lostlink.model.Role;
import edu.cit.taghoy.lostlink.repository.CategoryRepository;
import edu.cit.taghoy.lostlink.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(CategoryRepository categoryRepository, RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.count() == 0) {
                List<Role> roles = List.of(
                    new Role(null, "USER"),
                    new Role(null, "ADMIN")
                );
                roleRepository.saveAll(roles);
                System.out.println("[Seeder] Seeded " + roles.size() + " default roles.");
            }

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
                System.out.println("[Seeder] Seeded " + categories.size() + " default categories.");
            }
        };
    }
}
