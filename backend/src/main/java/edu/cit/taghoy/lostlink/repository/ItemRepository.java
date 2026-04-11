package edu.cit.taghoy.lostlink.repository;

import edu.cit.taghoy.lostlink.model.Item;
import edu.cit.taghoy.lostlink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUserOrderByCreatedAtDesc(User user);

    /** Items posted by user id (explicit association path; avoids ambiguous query derivation). */
    List<Item> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Item> findAllByOrderByCreatedAtDesc();

    @Query("SELECT i FROM Item i WHERE i.status <> 'RESOLVED' ORDER BY i.createdAt DESC")
    List<Item> findAllActive();

    @Query("SELECT i FROM Item i WHERE i.status <> 'RESOLVED' AND i.status = :status ORDER BY i.createdAt DESC")
    List<Item> findAllActiveByStatus(@Param("status") String status);

    @Query("SELECT i FROM Item i WHERE i.status <> 'RESOLVED' AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.aiTags) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY i.createdAt DESC")
    List<Item> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT i FROM Item i WHERE i.status <> 'RESOLVED' AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.aiTags) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "i.status = :status " +
           "ORDER BY i.createdAt DESC")
    List<Item> searchByKeywordAndStatus(@Param("keyword") String keyword, @Param("status") String status);

    @Query("SELECT i FROM Item i WHERE i.status <> 'RESOLVED' AND i.category.id = :categoryId ORDER BY i.createdAt DESC")
    List<Item> findAllActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT i FROM Item i WHERE i.status <> 'RESOLVED' " +
           "AND (:from IS NULL OR i.createdAt >= :from) " +
           "AND (:to IS NULL OR i.createdAt <= :to) " +
           "ORDER BY i.createdAt DESC")
    List<Item> findAllActiveByDateRange(@Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);
}
