-- Repair dump for machine listing visibility.
-- The current v4 dump seeds pcs rows with non-null deleted_at values,
-- which hides them from the admin machine listing endpoint.

USE onnetpc;

START TRANSACTION;

UPDATE pcs
SET deleted_at = NULL,
    status = 'available',
    updated_at = NOW()
WHERE deleted_at IS NOT NULL
  AND deleted_at <> '0000-00-00 00:00:00';

COMMIT;