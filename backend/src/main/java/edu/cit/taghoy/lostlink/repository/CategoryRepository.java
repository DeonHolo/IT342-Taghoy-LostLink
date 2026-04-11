package edu.cit.taghoy.lostlink.repository;

import edu.cit.taghoy.lostlink.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
