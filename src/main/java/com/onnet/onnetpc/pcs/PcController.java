package com.onnet.onnetpc.pcs;

import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.pcs.dto.MachineDetailResponse;
import com.onnet.onnetpc.pcs.dto.MachineListItemResponse;
import com.onnet.onnetpc.pcs.service.PcService;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pcs")
public class PcController {

    private final PcService pcService;

    public PcController(PcService pcService) {
        this.pcService = pcService;
    }

    @GetMapping
    public ApiResponse<Page<MachineListItemResponse>> getAvailableMachines(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "price_asc") String sort,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String cpu,
        @RequestParam(required = false) String gpu,
        @RequestParam(required = false) Integer ramMin,
        @RequestParam(required = false) Integer storageMin,
        @RequestParam(required = false) BigDecimal priceMin,
        @RequestParam(required = false) BigDecimal priceMax,
        @RequestParam(required = false) String purpose
    ) {
        return ApiResponse.success(pcService.listAvailable(
            page,
            size,
            sort,
            keyword,
            cpu,
            gpu,
            ramMin,
            storageMin,
            priceMin,
            priceMax,
            purpose
        ));
    }

    @GetMapping("/{pcId}")
    public ApiResponse<MachineDetailResponse> getMachineDetail(@PathVariable Long pcId) {
        return ApiResponse.success(pcService.getMachineDetail(pcId));
    }
}
