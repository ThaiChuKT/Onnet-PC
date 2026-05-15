package com.onnet.onnetpc.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@ConditionalOnProperty(name = "app.seed.catalog.enabled", havingValue = "true", matchIfMissing = true)
public class CatalogSeedConfig {

    @Bean
    ApplicationRunner seedCatalogData(JdbcTemplate jdbcTemplate) {
        return args -> {
            seedMembershipTiers(jdbcTemplate);
            seedPcSpecs(jdbcTemplate);
            seedTierSpecMappings(jdbcTemplate);
            seedPcs(jdbcTemplate);
            seedSubscriptionPlans(jdbcTemplate);
        };
    }

    private void seedMembershipTiers(JdbcTemplate jdbcTemplate) {
        if (countRows(jdbcTemplate, "membership_tiers") > 0) {
            return;
        }

        jdbcTemplate.update(
            """
                INSERT INTO membership_tiers
                    (id, tier_name, tier_level, monthly_fee, discount_percentage, support_level, is_active)
                VALUES
                    (1, 'Basic', 1, 15.00, 0.00, 'standard', 1),
                    (2, 'Pro', 2, 35.00, 5.00, 'priority', 1),
                    (3, 'Ultra', 3, 65.00, 10.00, 'vip', 1)
                """
        );
    }

    private void seedPcSpecs(JdbcTemplate jdbcTemplate) {
        if (countRows(jdbcTemplate, "pc_specs") > 0) {
            return;
        }

        jdbcTemplate.update(
            """
                INSERT INTO pc_specs
                    (id, spec_name, cpu, gpu, ram, storage, os, price_per_hour, description, is_exclusive, is_available)
                VALUES
                    (1, 'Basic Intel Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, '1080p esports gaming', 0, 1),
                    (2, 'Basic AMD Ryzen Core', 'AMD Ryzen 5 5600X', 'AMD Radeon RX 6600', 16, 512, 'Windows 11', 2.50, 'Cost-efficient 1080p gaming', 0, 1),
                    (3, 'Pro Intel Gaming', 'Intel Core i7-13700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 5.00, 'AAA gaming and livestreaming', 0, 1),
                    (4, 'Pro Ryzen Performance', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 1024, 'Windows 11', 5.00, 'High-refresh gaming and multitasking', 0, 1),
                    (5, 'Ultra Intel Ultimate', 'Intel Core i9-14900K', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.00, '4K gaming and workstation rendering', 1, 1),
                    (6, 'Ultra AMD Beast', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.00, 'AI workloads and heavy graphics', 1, 1)
                """
        );
    }

    private void seedTierSpecMappings(JdbcTemplate jdbcTemplate) {
        if (countRows(jdbcTemplate, "membership_tier_spec_mappings") > 0) {
            return;
        }

        jdbcTemplate.update(
            """
                INSERT INTO membership_tier_spec_mappings (tier_id, spec_id)
                VALUES
                    (1, 1), (1, 2),
                    (2, 3), (2, 4),
                    (3, 5), (3, 6)
                """
        );
    }

    private void seedPcs(JdbcTemplate jdbcTemplate) {
        if (countRows(jdbcTemplate, "pcs") > 0) {
            return;
        }

        List<Object[]> rows = new ArrayList<>();
        addPcRows(rows, 1, 10, "Zone Basic", 1, 2);
        addPcRows(rows, 11, 20, "Zone Pro", 3, 4);
        addPcRows(rows, 21, 30, "Zone Ultra", 5, 6);

        jdbcTemplate.batchUpdate(
            "INSERT INTO pcs (id, spec_id, status, location) VALUES (?, ?, 'available', ?)",
            rows
        );
    }

    private void seedSubscriptionPlans(JdbcTemplate jdbcTemplate) {
        if (countRows(jdbcTemplate, "subscription_plans") > 0) {
            return;
        }

        jdbcTemplate.batchUpdate(
            """
                INSERT INTO subscription_plans
                    (id, plan_name, spec_id, duration_days, price, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
                """,
            List.of(
                plan(1, "Basic Intel - Weekly", 1, 7, "15.00"),
                plan(2, "Basic AMD - Weekly", 2, 7, "15.00"),
                plan(3, "Pro Intel - Monthly", 3, 30, "100.00"),
                plan(4, "Pro AMD - Monthly", 4, 30, "100.00"),
                plan(5, "Ultra Intel - Monthly", 5, 30, "200.00"),
                plan(6, "Ultra AMD - Monthly", 6, 30, "200.00"),
                plan(7, "Basic Intel - Monthly", 1, 30, "50.00"),
                plan(8, "Basic AMD - Monthly", 2, 30, "50.00"),
                plan(9, "Basic Intel - Yearly", 1, 365, "500.00"),
                plan(10, "Basic AMD - Yearly", 2, 365, "500.00"),
                plan(11, "Pro Intel - Weekly", 3, 7, "30.00"),
                plan(12, "Pro AMD - Weekly", 4, 7, "30.00"),
                plan(13, "Pro Intel - Yearly", 3, 365, "1000.00"),
                plan(14, "Pro AMD - Yearly", 4, 365, "1000.00"),
                plan(15, "Ultra Intel - Weekly", 5, 7, "60.00"),
                plan(16, "Ultra AMD - Weekly", 6, 7, "60.00"),
                plan(17, "Ultra Intel - Yearly", 5, 365, "2000.00"),
                plan(18, "Ultra AMD - Yearly", 6, 365, "2000.00")
            )
        );
    }

    private long countRows(JdbcTemplate jdbcTemplate, String tableName) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Long.class);
        return count == null ? 0 : count;
    }

    private void addPcRows(List<Object[]> rows, int startId, int endId, String zone, int oddSpecId, int evenSpecId) {
        for (int id = startId; id <= endId; id++) {
            int seat = id - startId + 1;
            int specId = seat % 2 == 1 ? oddSpecId : evenSpecId;
            rows.add(new Object[] { id, specId, "%s - Seat %02d".formatted(zone, seat) });
        }
    }

    private Object[] plan(int id, String name, int specId, int durationDays, String price) {
        return new Object[] { id, name, specId, durationDays, new BigDecimal(price) };
    }
}
