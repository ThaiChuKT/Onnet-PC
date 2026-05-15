package com.onnet.onnetpc.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaRepair {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseSchemaRepair.class);

    private final JdbcTemplate jdbcTemplate;
    private final boolean enabled;

    public DatabaseSchemaRepair(
        JdbcTemplate jdbcTemplate,
        @Value("${app.database.schema-repair.enabled:true}") boolean enabled
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.enabled = enabled;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void repairRegistrationSchema() {
        if (!enabled) {
            return;
        }

        runRepair("email_verification_tokens.used_at nullable",
            "ALTER TABLE `email_verification_tokens` MODIFY COLUMN `used_at` timestamp NULL DEFAULT NULL");
        runRepair("password_reset_tokens.used_at nullable",
            "ALTER TABLE `password_reset_tokens` MODIFY COLUMN `used_at` datetime(6) NULL DEFAULT NULL");
        runRepair("users.updated_at current timestamp",
            "ALTER TABLE `users` MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()");
        runRepair("users.deleted_at nullable",
            "ALTER TABLE `users` MODIFY COLUMN `deleted_at` timestamp NULL DEFAULT NULL");
    }

    private void runRepair(String description, String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ex) {
            LOGGER.warn("Database schema repair skipped for {}: {}", description, ex.getMessage());
        }
    }
}
