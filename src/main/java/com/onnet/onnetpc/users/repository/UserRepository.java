package com.onnet.onnetpc.users.repository;

import com.onnet.onnetpc.users.User;
import java.util.Optional;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE User u
        SET u.active = false,
            u.deletedAt = :deletedAt,
            u.updatedAt = :updatedAt
        WHERE u.id = :userId
          AND (u.role IS NULL OR u.role <> com.onnet.onnetpc.users.UserRole.admin)
        """)
    int softDeleteNonAdminById(
        @Param("userId") Long userId,
        @Param("deletedAt") Instant deletedAt,
        @Param("updatedAt") Instant updatedAt
    );
}
