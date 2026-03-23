package com.onnet.onnetpc.users.repository;

import com.onnet.onnetpc.users.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Page<User> findByDeletedAtIsNull(Pageable pageable);

    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String fullNameKeyword,
        String emailKeyword,
        Pageable pageable
    );

    Page<User> findByDeletedAtIsNullAndFullNameContainingIgnoreCaseOrDeletedAtIsNullAndEmailContainingIgnoreCase(
        String fullNameKeyword,
        String emailKeyword,
        Pageable pageable
    );
}
