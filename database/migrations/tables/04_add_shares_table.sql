-- ============================================================================
-- TODO ÉTAPE 5.4 : TABLE 4 -> SHARES (Partages de pépites) (DDL)

-- Relation Merise : items (1,1) --- (0,N) shares (un item appartient à un utilisateur)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

CREATE TABLE IF NOT EXISTS shares (
    id_share UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES items (id_item) ON DELETE CASCADE,
    recipient_email CITEXT,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    access_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Index pour recherche par item (liste des partages d'une pépite)
CREATE INDEX IF NOT EXISTS idx_shares_item ON shares (item_id);

-- Documentation
COMMENT ON TABLE shares IS 'Gère les partages temporaires ou permanents des pépites via un token unique';
COMMENT ON COLUMN shares.recipient_email IS 'Email de l invité (optionnel pour partage public)';
COMMENT ON COLUMN shares.share_token IS 'Token sécurisé généré côté backend (crypto.randomBytes)';
COMMENT ON COLUMN shares.access_config IS 'Configuration flexible du partage :
{
  "level": "read",
  "allow_download": false,
  "expiration": "2026-01-31T23:59:59Z",
  "password": "$2b$10$hash...",
  "max_views": 10,
  "view_count": 0
}';

-- Application du trigger
CREATE TRIGGER set_timestamp_shares BEFORE UPDATE ON shares FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
