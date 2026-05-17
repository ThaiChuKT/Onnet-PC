-- Run this once on the Aiven MySQL database if registration returns HTTP 500.
-- It aligns nullable timestamp columns with the JPA entities used by the app.

ALTER TABLE `email_verification_tokens`
  MODIFY COLUMN `used_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `password_reset_tokens`
  MODIFY COLUMN `used_at` datetime(6) NULL DEFAULT NULL;

ALTER TABLE `users`
  MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  MODIFY COLUMN `deleted_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `bookings`
  MODIFY COLUMN `end_time` timestamp NULL DEFAULT NULL,
  MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

ALTER TABLE `sessions`
  MODIFY COLUMN `end_time` timestamp NULL DEFAULT NULL;

ALTER TABLE `pcs`
  MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  MODIFY COLUMN `deleted_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `payments`
  MODIFY COLUMN `paid_at` timestamp NULL DEFAULT NULL,
  MODIFY COLUMN `refunded_at` timestamp NULL DEFAULT NULL;
