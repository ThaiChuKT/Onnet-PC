CREATE TABLE IF NOT EXISTS `sunshine_hosts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `host_address` varchar(255) NOT NULL,
  `host_port` int NOT NULL DEFAULT 47989,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `notes` varchar(500) DEFAULT NULL,
  `paired_client_uuid` varchar(128) DEFAULT NULL,
  `paired_client_name` varchar(120) DEFAULT NULL,
  `paired_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sunshine_hosts_enabled` (`enabled`),
  KEY `idx_sunshine_hosts_created_by` (`created_by`),
  CONSTRAINT `fk_sunshine_hosts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `moonlight_host_actions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `host_id` bigint(20) NOT NULL,
  `booking_id` bigint(20) DEFAULT NULL,
  `requested_by` bigint(20) DEFAULT NULL,
  `action_type` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `pin` varchar(20) DEFAULT NULL,
  `request_source` varchar(30) DEFAULT NULL,
  `request_note` varchar(500) DEFAULT NULL,
  `result_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_moonlight_actions_host` (`host_id`),
  KEY `idx_moonlight_actions_booking` (`booking_id`),
  KEY `idx_moonlight_actions_requested_by` (`requested_by`),
  KEY `idx_moonlight_actions_status` (`status`),
  CONSTRAINT `fk_moonlight_actions_host` FOREIGN KEY (`host_id`) REFERENCES `sunshine_hosts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_moonlight_actions_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_moonlight_actions_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `moonlight_command_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `host_id` bigint(20) NOT NULL,
  `requested_by` bigint(20) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `command_text` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `output_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_moonlight_logs_host` (`host_id`),
  KEY `idx_moonlight_logs_requested_by` (`requested_by`),
  CONSTRAINT `fk_moonlight_logs_host` FOREIGN KEY (`host_id`) REFERENCES `sunshine_hosts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_moonlight_logs_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `sunshine_hosts` (`name`, `host_address`, `host_port`, `enabled`, `notes`, `created_at`, `updated_at`)
SELECT 'Primary Sunshine Host', '58.187.67.90', 47989, 1, 'Initial host provided during Moonlight/Sunshine integration', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `sunshine_hosts` WHERE `host_address` = '58.187.67.90'
);
