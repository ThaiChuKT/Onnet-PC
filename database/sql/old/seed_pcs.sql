-- Reseed core rentable data for 3 plans: Basic, Pro, Ultra
-- Each plan has exactly 5 PCs.
-- This script is intended for local/dev reseed.

USE onnetpc;

START TRANSACTION;

-- Clear dependent runtime data first so specs/pcs can be recreated safely. (bỏ nếu lỗi)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE session_queue;
TRUNCATE TABLE sessions;
TRUNCATE TABLE reviews;
TRUNCATE TABLE bookings;
TRUNCATE TABLE subscription_plans;
TRUNCATE TABLE pcs;
TRUNCATE TABLE membership_tier_spec_mappings;
TRUNCATE TABLE pc_specs;
SET FOREIGN_KEY_CHECKS = 1;

-- 3 plan specs (Basic / Pro / Ultra)
INSERT INTO pc_specs (
  spec_name,
  cpu,
  gpu,
  ram,
  storage,
  os,
  price_per_hour,
  description,
  is_exclusive,
  is_available
) VALUES
  (
    'Basic',
    'Intel Core i5-12400F',
    'NVIDIA RTX 3060 12GB',
    16,
    512,
    'Windows 11',
    2.20,
    'Balanced entry gaming and study workloads',
    FALSE,
    TRUE
  ),
  (
    'Pro',
    'Intel Core i7-13700F',
    'NVIDIA RTX 4070 Super 12GB',
    32,
    1024,
    'Windows 11',
    4.30,
    'High-FPS gaming, editing, and streaming',
    FALSE,
    TRUE
  ),
  (
    'Ultra',
    'Intel Core i9-14900K',
    'NVIDIA RTX 4090 24GB',
    64,
    2048,
    'Windows 11 Pro',
    8.90,
    'Top-tier rendering, AI, and premium gaming',
    TRUE,
    TRUE
  );

-- Map tiers to specs (by tier name, case-insensitive)
INSERT INTO membership_tier_spec_mappings (tier_id, spec_id)
SELECT t.id, s.id
FROM membership_tiers t
JOIN pc_specs s ON LOWER(t.tier_name) = LOWER(s.spec_name)
WHERE LOWER(t.tier_name) IN ('basic', 'pro', 'ultra');

-- Seed 5 physical machines per plan
-- Basic (5)
INSERT INTO pcs (spec_id, status, location, updated_at, deleted_at)
SELECT s.id, 'available', CONCAT('Zone A - Seat 0', n.num), NOW(), NULL
FROM pc_specs s
JOIN (
  SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
) n
WHERE s.spec_name = 'Basic';

-- Pro (5)
INSERT INTO pcs (spec_id, status, location, updated_at, deleted_at)
SELECT s.id, 'available', CONCAT('Zone B - Seat 0', n.num), NOW(), NULL
FROM pc_specs s
JOIN (
  SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
) n
WHERE s.spec_name = 'Pro';

-- Ultra (5)
INSERT INTO pcs (spec_id, status, location, updated_at, deleted_at)
SELECT s.id, 'available', CONCAT('Zone C - Seat 0', n.num), NOW(), NULL
FROM pc_specs s
JOIN (
  SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
) n
WHERE s.spec_name = 'Ultra';

-- Seed subscription plans for each spec
-- Weekly  = hourly * 4
-- Monthly = hourly * 12
-- Yearly  = hourly * 120

INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT
  CONCAT(s.spec_name, ' - Weekly'),
  s.id,
  7,
  ROUND(s.price_per_hour * 4, 2),
  NULL,
  TRUE
FROM pc_specs s
WHERE s.spec_name IN ('Basic', 'Pro', 'Ultra');

INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT
  CONCAT(s.spec_name, ' - Monthly'),
  s.id,
  30,
  ROUND(s.price_per_hour * 12, 2),
  NULL,
  TRUE
FROM pc_specs s
WHERE s.spec_name IN ('Basic', 'Pro', 'Ultra');

INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT
  CONCAT(s.spec_name, ' - Yearly'),
  s.id,
  365,
  ROUND(s.price_per_hour * 120, 2),
  NULL,
  TRUE
FROM pc_specs s
WHERE s.spec_name IN ('Basic', 'Pro', 'Ultra');

COMMIT;
