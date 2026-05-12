CREATE VIEW v_app_events_critical AS
SELECT
  id_event,
  user_id,
  event_category,
  event_type,
  severity,
  message,
  created_at
FROM app_events
WHERE severity IN ('warning', 'error', 'critical');
