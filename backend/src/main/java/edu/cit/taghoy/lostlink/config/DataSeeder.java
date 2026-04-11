package edu.cit.taghoy.lostlink.config;

import edu.cit.taghoy.lostlink.model.Category;
import edu.cit.taghoy.lostlink.model.Role;
import edu.cit.taghoy.lostlink.repository.CategoryRepository;
import edu.cit.taghoy.lostlink.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Configuration
public class DataSeeder {

    /**
     * After switching User from a string role to a FK to {@link Role}, existing MySQL rows often
     * end up with {@code role_id = 0} or NULL. Hibernate then throws
     * "Unable to find Role with id 0" on login. This repair runs on every startup (cheap) and fixes
     * any user whose {@code role_id} does not reference a real row in {@code roles}.
     */
    @Bean
    CommandLineRunner seedData(
            CategoryRepository categoryRepository,
            RoleRepository roleRepository,
            JdbcTemplate jdbcTemplate
    ) {
        return args -> {
            // Old schema stored role as VARCHAR; the entity now uses role_id only. MySQL still had
            // NOT NULL `role` with no default → INSERT fails. Remove the leftover column if present.
            Integer legacyRoleCol = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*) FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'users'
                      AND COLUMN_NAME = 'role'
                    """,
                    Integer.class
            );
            if (legacyRoleCol != null && legacyRoleCol > 0) {
                jdbcTemplate.execute("ALTER TABLE users DROP COLUMN `role`");
                System.out.println("[Seeder] Dropped legacy column users.`role` (use role_id + roles table only).");
            }

            if (roleRepository.count() == 0) {
                List<Role> roles = List.of(
                    new Role(null, "USER"),
                    new Role(null, "ADMIN")
                );
                roleRepository.saveAll(roles);
                System.out.println("[Seeder] Seeded " + roles.size() + " default roles.");
            }

            long userRoleId = roleRepository.findByRoleName("USER")
                    .map(Role::getId)
                    .orElseThrow(() -> new IllegalStateException("USER role missing after seed; check roles table."));

            int repaired = jdbcTemplate.update(
                    """
                    UPDATE users u
                    SET u.role_id = ?
                    WHERE u.role_id IS NULL
                       OR u.role_id = 0
                       OR NOT EXISTS (SELECT 1 FROM roles r WHERE r.id = u.role_id)
                    """,
                    userRoleId
            );
            if (repaired > 0) {
                System.out.println("[Seeder] Repaired role_id on " + repaired + " user row(s) (was 0, NULL, or invalid FK).");
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
