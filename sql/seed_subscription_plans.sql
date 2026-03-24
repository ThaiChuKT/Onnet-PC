-- Seed subscription plans for all active PC specs.
-- Pricing rule (effective hourly):
-- Weekly  = 75% of hourly
-- Monthly = 60% of hourly
-- Yearly  = 45% of hourly
-- This guarantees: yearly <= monthly <= weekly <= hourly

USE onnetpc;

START TRANSACTION;

-- Re-runnable: remove old generated weekly/monthly/yearly plans first.
DELETE sp
FROM subscription_plans sp
WHERE sp.duration_days IN (7, 30, 365)
  AND (
    sp.plan_name LIKE '% - Weekly'
    OR sp.plan_name LIKE '% - Monthly'
    OR sp.plan_name LIKE '% - Yearly'
  );

-- Weekly plans
INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT
  CONCAT(ps.spec_name, ' - Weekly') AS plan_name,
  ps.id AS spec_id,
  7 AS duration_days,
  ROUND(ps.price_per_hour * 24 * 7 * 0.75, 2) AS price,
  NULL AS max_hours_per_day,
  TRUE AS is_active
FROM pc_specs ps
WHERE ps.is_available = TRUE;

-- Monthly plans
INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT
  CONCAT(ps.spec_name, ' - Monthly') AS plan_name,
  ps.id AS spec_id,
  30 AS duration_days,
  ROUND(ps.price_per_hour * 24 * 30 * 0.60, 2) AS price,
  NULL AS max_hours_per_day,
  TRUE AS is_active
FROM pc_specs ps
WHERE ps.is_available = TRUE;

-- Yearly plans
INSERT INTO subscription_plans (
  plan_name,
  spec_id,
  duration_days,
  price,
  max_hours_per_day,
  is_active
)
SELECT
  CONCAT(ps.spec_name, ' - Yearly') AS plan_name,
  ps.id AS spec_id,
  365 AS duration_days,
  ROUND(ps.price_per_hour * 24 * 365 * 0.45, 2) AS price,
  NULL AS max_hours_per_day,
  TRUE AS is_active
FROM pc_specs ps
WHERE ps.is_available = TRUE;

COMMIT;

-- Optional sanity check query:
-- SELECT ps.spec_name, sp.plan_name, sp.duration_days, sp.price,
--        ROUND(sp.price / (sp.duration_days * 24), 4) AS effective_hourly
-- FROM subscription_plans sp
-- JOIN pc_specs ps ON ps.id = sp.spec_id
-- WHERE sp.duration_days IN (7, 30, 365)
-- ORDER BY ps.spec_name, sp.duration_days;
