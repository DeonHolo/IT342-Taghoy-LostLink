package edu.cit.taghoy.lostlink.feature.category.repository;

import edu.cit.taghoy.lostlink.feature.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
