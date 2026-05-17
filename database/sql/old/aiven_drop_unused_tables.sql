-- Removes legacy tables that no current backend/frontend code uses.
-- Keep session_queue: it is still used by the session lifecycle when no PC is available.

DROP TABLE IF EXISTS `session_files`;
DROP TABLE IF EXISTS `ai_recommendations`;
