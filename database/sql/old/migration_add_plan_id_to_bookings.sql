-- Migration: Add plan_id to bookings table to track which subscription plan was purchased
-- This allows the cart to correctly identify weekly/monthly/yearly plans even if prices align

USE onnetpc;

START TRANSACTION;

-- Add plan_id column to bookings table if it doesn't exist
ALTER TABLE `bookings`
ADD COLUMN `plan_id` BIGINT(20) DEFAULT NULL AFTER `spec_id`;

-- Add foreign key constraint to subscription_plans
ALTER TABLE `bookings`
ADD CONSTRAINT `bookings_ibfk_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX `idx_bookings_plan_id` ON `bookings` (`plan_id`);

-- Add index for querying bookings by spec and status
CREATE INDEX `idx_bookings_spec_status` ON `bookings` (`spec_id`, `status`);

COMMIT;
