SELECT
    message,
    metadata->>'duration_ms' AS duree,
    metadata->>'query' AS requete_en_cause
FROM app_events
WHERE severity = 'warning';
