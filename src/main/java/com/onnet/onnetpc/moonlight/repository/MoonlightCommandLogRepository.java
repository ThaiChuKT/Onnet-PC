package com.onnet.onnetpc.moonlight.repository;

import com.onnet.onnetpc.moonlight.entity.MoonlightCommandLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MoonlightCommandLogRepository extends JpaRepository<MoonlightCommandLog, Long> {

    List<MoonlightCommandLog> findTop20ByHostIdOrderByCreatedAtDesc(Long hostId);
}
