-- ============================================================================
-- TODO ÉTAPE 5.2 : TABLE 2 -> TAGS (Catégories personnalisées) (DDL)

-- Relation Merise : users (1,N) --- (1,1) tags (un tag appartient à un utilisateur)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

CREATE TABLE IF NOT EXISTS tags (
    id_tag UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id_user) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NUll DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_user_tag UNIQUE (user_id, tag_name) -- Un utilisateur ne peut pas avoir deux fois le même tag
);

-- Index pour requêtes par utilisateur (liste de ses tags)
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags (user_id);

-- Index pour recherche floue sur les noms de tags
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON tags USING gin (tag_name gin_trgm_ops);

-- Documentation
COMMENT ON TABLE tags IS 'Mots-clés personnalisés créés par les utilisateurs pour organiser leurs pépites';
COMMENT ON COLUMN tags.tag_name IS 'Nom du tag (insensible à la casse via CITEXT)';

-- Application du trigger
CREATE TRIGGER set_timestamp_tags BEFORE UPDATE ON tags FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
