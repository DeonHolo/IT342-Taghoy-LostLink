package edu.cit.taghoy.lostlink.feature.user.repository;

import edu.cit.taghoy.lostlink.feature.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByStudentId(String studentId);

    Optional<User> findByGoogleSub(String googleSub);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);

    long countBySuspendedTrue();
}
