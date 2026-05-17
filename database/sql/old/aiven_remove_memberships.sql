-- Removes the unused membership/user-subscription schema.
-- Run after deploying code that no longer references these tables/columns.

DROP PROCEDURE IF EXISTS drop_fk_if_exists;
DROP PROCEDURE IF EXISTS drop_column_if_exists;

DELIMITER //
CREATE PROCEDURE drop_fk_if_exists(IN table_name_in VARCHAR(64), IN column_name_in VARCHAR(64))
BEGIN
  DECLARE fk_name VARCHAR(64);
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET fk_name = NULL;

  SELECT CONSTRAINT_NAME
    INTO fk_name
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = table_name_in
     AND COLUMN_NAME = column_name_in
     AND REFERENCED_TABLE_NAME IS NOT NULL
   LIMIT 1;

  IF fk_name IS NOT NULL THEN
    SET @sql = CONCAT('ALTER TABLE `', table_name_in, '` DROP FOREIGN KEY `', fk_name, '`');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL drop_fk_if_exists('users', 'tier_id');
CALL drop_fk_if_exists('session_queue', 'tier_id');
CALL drop_fk_if_exists('membership_tier_spec_mappings', 'tier_id');
CALL drop_fk_if_exists('membership_tier_spec_mappings', 'spec_id');
CALL drop_fk_if_exists('user_memberships', 'user_id');
CALL drop_fk_if_exists('user_memberships', 'tier_id');
CALL drop_fk_if_exists('user_subscriptions', 'user_id');
CALL drop_fk_if_exists('user_subscriptions', 'plan_id');
CALL drop_fk_if_exists('user_subscriptions', 'pc_id');

DROP PROCEDURE IF EXISTS drop_fk_if_exists;

DELIMITER //
CREATE PROCEDURE drop_column_if_exists(IN table_name_in VARCHAR(64), IN column_name_in VARCHAR(64))
BEGIN
  DECLARE column_count INT DEFAULT 0;

  SELECT COUNT(*)
    INTO column_count
    FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = table_name_in
     AND COLUMN_NAME = column_name_in;

  IF column_count > 0 THEN
    SET @sql = CONCAT('ALTER TABLE `', table_name_in, '` DROP COLUMN `', column_name_in, '`');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL drop_column_if_exists('users', 'tier_id');
CALL drop_column_if_exists('session_queue', 'tier_id');

DROP PROCEDURE IF EXISTS drop_column_if_exists;

DROP TABLE IF EXISTS `user_subscriptions`;
DROP TABLE IF EXISTS `user_memberships`;
DROP TABLE IF EXISTS `membership_tier_spec_mappings`;
DROP TABLE IF EXISTS `membership_tiers`;
