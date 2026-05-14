ALTER TABLE `sunshine_hosts`
  ADD COLUMN `paired_client_uuid` varchar(128) DEFAULT NULL AFTER `notes`,
  ADD COLUMN `paired_client_name` varchar(120) DEFAULT NULL AFTER `paired_client_uuid`,
  ADD COLUMN `paired_at` timestamp NULL DEFAULT NULL AFTER `paired_client_name`;

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