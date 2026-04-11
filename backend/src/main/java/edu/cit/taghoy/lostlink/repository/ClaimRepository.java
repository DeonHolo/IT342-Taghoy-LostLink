package edu.cit.taghoy.lostlink.repository;

import edu.cit.taghoy.lostlink.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Optional<Claim> findByItemIdAndUserId(Long itemId, Long userId);

    List<Claim> findByItemIdOrderByRevealedAtDesc(Long itemId);

    List<Claim> findByUserIdOrderByRevealedAtDesc(Long userId);

    boolean existsByItemIdAndUserId(Long itemId, Long userId);
}
