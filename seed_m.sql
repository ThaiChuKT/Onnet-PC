-- Seed data for G1/G2: 3 machine groups, each group has 5 machines.
-- Re-runnable script for schema in v2_rs.sql.

USE onnetpc;

START TRANSACTION;

-- -----------------------------
-- Clean old sample data (for re-run)
-- -----------------------------
DELETE sp
FROM subscription_plans sp
JOIN pc_specs ps ON ps.id = sp.spec_id
WHERE ps.spec_name IN ('Starter Arena', 'Pro Arena', 'Creator Arena');

DELETE p
FROM pcs p
JOIN pc_specs ps ON ps.id = p.spec_id
WHERE ps.spec_name IN ('Starter Arena', 'Pro Arena', 'Creator Arena');

DELETE FROM pc_specs
WHERE spec_name IN ('Starter Arena', 'Pro Arena', 'Creator Arena');

-- -----------------------------
-- 3 machine groups (pc_specs)
-- -----------------------------
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
    'Starter Arena',
    'Intel Core i5-12400F',
    'NVIDIA RTX 3060',
    16,
    512,
    'Windows 11',
    2.90,
    'Nhom co ban cho hoc tap, game eSports va nhu cau pho thong',
    FALSE,
    TRUE
  ),
  (
    'Pro Arena',
    'Intel Core i7-13700F',
    'NVIDIA RTX 4070',
    32,
    1024,
    'Windows 11',
    4.90,
    'Nhom hieu nang cao cho AAA gaming, stream va da nhiem',
    FALSE,
    TRUE
  ),
  (
    'Creator Arena',
    'AMD Ryzen 9 7900X',
    'NVIDIA RTX 4080 Super',
    64,
    2048,
    'Windows 11 Pro',
    7.90,
    'Nhom workstation cho edit video, 3D va do hoa nang',
    FALSE,
    TRUE
  );

-- -----------------------------
-- 5 machines per group (total 15)
-- -----------------------------
INSERT INTO pcs (spec_id, status, location, updated_at, deleted_at) VALUES
  ((SELECT id FROM pc_specs WHERE spec_name = 'Starter Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 01', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Starter Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 02', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Starter Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 03', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Starter Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 04', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Starter Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 05', NOW(), NULL),

  ((SELECT id FROM pc_specs WHERE spec_name = 'Pro Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 01', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Pro Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 02', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Pro Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 03', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Pro Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 04', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Pro Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 05', NOW(), NULL),

  ((SELECT id FROM pc_specs WHERE spec_name = 'Creator Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 01', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Creator Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 02', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Creator Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 03', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Creator Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 04', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Creator Arena' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 05', NOW(), NULL);

-- -----------------------------
-- Monthly/Yearly package prices for detail page (G2)
-- -----------------------------
INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT CONCAT(ps.spec_name, ' - Monthly'), ps.id, 30, ROUND(ps.price_per_hour * 150, 2), NULL, TRUE
FROM pc_specs ps
WHERE ps.spec_name IN ('Starter Arena', 'Pro Arena', 'Creator Arena');

INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT CONCAT(ps.spec_name, ' - Yearly'), ps.id, 365, ROUND(ps.price_per_hour * 1500, 2), NULL, TRUE
FROM pc_specs ps
WHERE ps.spec_name IN ('Starter Arena', 'Pro Arena', 'Creator Arena');

COMMIT;
