package com.onnet.onnetpc.pcs.repository;

import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PcRepository extends JpaRepository<Pc, Long> {

    Page<Pc> findByStatus(PcStatus status, Pageable pageable);
}
