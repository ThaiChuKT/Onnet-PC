package com.onnet.onnetpc.moonlight.repository;

import com.onnet.onnetpc.moonlight.entity.SunshineHost;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SunshineHostRepository extends JpaRepository<SunshineHost, Long> {

    List<SunshineHost> findAllByEnabledTrueOrderByNameAsc();

    List<SunshineHost> findAllByOrderByNameAsc();

    Optional<SunshineHost> findByPcId(Long pcId);

    Optional<SunshineHost> findFirstByPcId(Long pcId);
}
