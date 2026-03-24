-- Seed data for rentable PCs (specs + pcs + subscription plans)
-- Safe to import into the existing onnetpc schema from v2_rs.sql.

USE onnetpc;

START TRANSACTION;

-- PC SPECS
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
  ('Nebula Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Entry gaming and school projects', FALSE, TRUE),
  ('Nebula Plus', 'Intel Core i5-13400F', 'NVIDIA RTX 4060', 16, 1024, 'Windows 11', 3.20, '1080p ultra gaming and livestreaming', FALSE, TRUE),
  ('Nebula Creator', 'AMD Ryzen 7 5700X', 'NVIDIA RTX 4060 Ti', 32, 1024, 'Windows 11', 3.80, 'Video editing and design workflows', FALSE, TRUE),
  ('Orion Balanced', 'Intel Core i7-12700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 4.70, 'Balanced gaming and productivity', FALSE, TRUE),
  ('Orion Pro', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 2048, 'Windows 11', 5.40, '4K content creation and rendering', FALSE, TRUE),
  ('Atlas Gamer', 'Intel Core i7-13700K', 'NVIDIA RTX 4080', 32, 2048, 'Windows 11', 6.90, 'High refresh AAA gaming setup', FALSE, TRUE),
  ('Atlas Creator', 'AMD Ryzen 9 7900X', 'NVIDIA RTX 4080 Super', 64, 2048, 'Windows 11', 7.80, 'Heavy Adobe and Blender projects', FALSE, TRUE),
  ('Titan Workstation', 'Intel Core i9-13900K', 'NVIDIA RTX 4090', 64, 4096, 'Windows 11 Pro', 9.50, 'Workstation class compute and rendering', TRUE, TRUE),
  ('Titan AI', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 128, 4096, 'Ubuntu 22.04', 10.50, 'ML experiments and container workflows', TRUE, TRUE),
  ('Zephyr Dev', 'AMD Ryzen 5 7600', 'NVIDIA RTX 3070', 32, 1024, 'Ubuntu 22.04', 4.20, 'Programming, docker, and test automation', FALSE, TRUE);

-- PCS (physical machines linked to specs)
INSERT INTO pcs (
  spec_id,
  status,
  location,
  updated_at,
  deleted_at
) VALUES
  ((SELECT id FROM pc_specs WHERE spec_name = 'Nebula Starter' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 01', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Nebula Plus' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 02', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Nebula Creator' ORDER BY id DESC LIMIT 1), 'available', 'Zone A - Seat 03', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Orion Balanced' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 01', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Orion Pro' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 02', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Atlas Gamer' ORDER BY id DESC LIMIT 1), 'available', 'Zone B - Seat 03', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Atlas Creator' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 01', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Titan Workstation' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 02', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Titan AI' ORDER BY id DESC LIMIT 1), 'available', 'Zone C - Seat 03', NOW(), NULL),
  ((SELECT id FROM pc_specs WHERE spec_name = 'Zephyr Dev' ORDER BY id DESC LIMIT 1), 'available', 'Zone D - Seat 01', NOW(), NULL);

-- SUBSCRIPTION PLANS (7/30/365 days) for each spec so detail page can display package prices
INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT CONCAT(s.spec_name, ' - Weekly'), s.id, 7, ROUND(s.price_per_hour * 4, 2), NULL, TRUE
FROM pc_specs s
WHERE s.spec_name IN (
  'Nebula Starter',
  'Nebula Plus',
  'Nebula Creator',
  'Orion Balanced',
  'Orion Pro',
  'Atlas Gamer',
  'Atlas Creator',
  'Titan Workstation',
  'Titan AI',
  'Zephyr Dev'
);

INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT CONCAT(s.spec_name, ' - Monthly'), s.id, 30, ROUND(s.price_per_hour * 12, 2), NULL, TRUE
FROM pc_specs s
WHERE s.spec_name IN (
  'Nebula Starter',
  'Nebula Plus',
  'Nebula Creator',
  'Orion Balanced',
  'Orion Pro',
  'Atlas Gamer',
  'Atlas Creator',
  'Titan Workstation',
  'Titan AI',
  'Zephyr Dev'
);

INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT CONCAT(s.spec_name, ' - Yearly'), s.id, 365, ROUND(s.price_per_hour * 120, 2), NULL, TRUE
FROM pc_specs s
WHERE s.spec_name IN (
  'Nebula Starter',
  'Nebula Plus',
  'Nebula Creator',
  'Orion Balanced',
  'Orion Pro',
  'Atlas Gamer',
  'Atlas Creator',
  'Titan Workstation',
  'Titan AI',
  'Zephyr Dev'
);

COMMIT;
