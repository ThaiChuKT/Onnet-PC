package com.onnet.onnetpc.users.repository;

import com.onnet.onnetpc.users.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("""
        select u
        from User u
        where u.deletedAt is null
          and (:keyword is null or lower(u.fullName) like lower(concat('%', :keyword, '%')) or lower(u.email) like lower(concat('%', :keyword, '%')))
    """)
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}
