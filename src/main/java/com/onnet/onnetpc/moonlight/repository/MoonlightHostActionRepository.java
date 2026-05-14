package com.onnet.onnetpc.moonlight.repository;

import com.onnet.onnetpc.moonlight.entity.MoonlightHostAction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MoonlightHostActionRepository extends JpaRepository<MoonlightHostAction, Long> {

    List<MoonlightHostAction> findTop20ByStatusOrderByCreatedAtAsc(String status);

    Optional<MoonlightHostAction> findByIdAndStatus(Long id, String status);
}