-- ============================================================================
-- TODO ÉTAPE 5.6 : TABLE 6 -> APP_EVENTS (Analytics, Logs, Monitoring, RGPD) (DDL)

-- Relation Merise : events (0,1) --- (1,N) users (Un événement peut être lié à 0 ou 1 utilisateur)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';
CREATE TABLE IF NOT EXISTS app_events (
    id_event UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id_user) ON DELETE SET NULL,  -- Nullable pour événements système
    event_category event_category_enum NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    severity severity_enum DEFAULT 'info',
    message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index composite pour filtrer par catégorie + date (requête la plus courante)
CREATE INDEX IF NOT EXISTS idx_events_category_date ON app_events (event_category, created_at DESC);

-- Index pour recherche par utilisateur
CREATE INDEX IF NOT EXISTS idx_events_user ON app_events (user_id) WHERE user_id IS NOT NULL;

-- Index GIN pour recherche dans metadata
CREATE INDEX IF NOT EXISTS idx_events_metadata ON app_events USING gin (metadata);

-- Index pour les événements critiques (alerte monitoring)
CREATE INDEX IF NOT EXISTS idx_events_critical ON app_events (severity, created_at DESC) WHERE severity = 'critical';


-- Documentation
COMMENT ON TABLE app_events IS 'Table unifiée pour analytics, audit, monitoring et événements RGPD';
COMMENT ON COLUMN app_events.event_type IS 'Type précis avec convention : [domaine].[action] (ex: user.login, item.created, gdpr.export)';
COMMENT ON COLUMN app_events.severity IS 'Niveau de gravité (utile pour filtrer les alertes monitoring)';
COMMENT ON COLUMN app_events.message IS 'Message lisible pour les humains (logs, dashboards)';
COMMENT ON COLUMN app_events.metadata IS 'Contexte flexible en JSONB :
{
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "item_id": "uuid...",
  "error_stack": "...",
  "duration_ms": 234
}';
