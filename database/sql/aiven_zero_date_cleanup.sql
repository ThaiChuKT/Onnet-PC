-- Run this once on Aiven before enabling Hibernate validation-only deployments.
-- It removes legacy MySQL zero timestamp values that block ALTER TABLE / FK DDL.

SET @OLD_SQL_MODE = @@SESSION.sql_mode;
SET SESSION sql_mode = REPLACE(REPLACE(@@SESSION.sql_mode, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '');

UPDATE `bookings`
SET `updated_at` = COALESCE(`created_at`, current_timestamp())
WHERE `updated_at` = '0000-00-00 00:00:00';

UPDATE `bookings`
SET `end_time` = NULL
WHERE `end_time` = '0000-00-00 00:00:00';

UPDATE `users`
SET `updated_at` = COALESCE(`created_at`, current_timestamp())
WHERE `updated_at` = '0000-00-00 00:00:00';

UPDATE `users`
SET `deleted_at` = NULL
WHERE `deleted_at` = '0000-00-00 00:00:00';

UPDATE `pcs`
SET `updated_at` = current_timestamp()
WHERE `updated_at` = '0000-00-00 00:00:00';

UPDATE `pcs`
SET `deleted_at` = NULL
WHERE `deleted_at` = '0000-00-00 00:00:00';

UPDATE `sessions`
SET `end_time` = NULL
WHERE `end_time` = '0000-00-00 00:00:00';

UPDATE `payments`
SET `paid_at` = NULL
WHERE `paid_at` = '0000-00-00 00:00:00';

UPDATE `payments`
SET `refunded_at` = NULL
WHERE `refunded_at` = '0000-00-00 00:00:00';

ALTER TABLE `bookings`
  MODIFY COLUMN `end_time` timestamp NULL DEFAULT NULL,
  MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

ALTER TABLE `users`
  MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  MODIFY COLUMN `deleted_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `pcs`
  MODIFY COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  MODIFY COLUMN `deleted_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `sessions`
  MODIFY COLUMN `end_time` timestamp NULL DEFAULT NULL;

ALTER TABLE `payments`
  MODIFY COLUMN `paid_at` timestamp NULL DEFAULT NULL,
  MODIFY COLUMN `refunded_at` timestamp NULL DEFAULT NULL;

SET SESSION sql_mode = @OLD_SQL_MODE;
