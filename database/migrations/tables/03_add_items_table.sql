-- ============================================================================
-- TODO ÉTAPE 5.3 : TABLE 3 -> ITEMS (Les pépites - Cœur de l'application) (DDL)

-- Relation Merise : users (1,N) --- (1,1) items (un item appartient à un utilisateur)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

CREATE TABLE IF NOT EXISTS items (
    id_item UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id_user) ON DELETE CASCADE,
    content_type content_type_enum NOT NULL,
    title CITEXT NOT NULL,
    slug CITEXT NOT NULL,
    content TEXT NOT NULL,
    source_author VARCHAR(50) NOT NULL DEFAULT 'N.C',
    thumbnail_url VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}', -- Recherche puissante ici
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_user_item_title UNIQUE (user_id, title),  -- Un user ne peut pas avoir deux fois le même titre
    CONSTRAINT unique_user_item_slug UNIQUE (user_id, slug)    -- Le slug doit être unique par utilisateur
);

-- Index GIN pour recherche floue sur le titre (Trigram)
CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON items USING gin (title gin_trgm_ops);

-- Index GIN pour recherche dans les métadonnées JSONB
CREATE INDEX IF NOT EXISTS idx_items_metadata ON items USING gin (metadata);

-- Index composite pour filtrer par utilisateur + type
CREATE INDEX IF NOT EXISTS idx_items_user_type ON items (user_id, content_type);

-- Index pour recherche par utilisateur (requête la plus fréquente)
CREATE INDEX IF NOT EXISTS idx_items_user ON items (user_id);

-- Documentation
COMMENT ON TABLE items IS 'Le cœur du coffre-fort : stocke les pépites (notes, citations, résumés, liens)';
COMMENT ON COLUMN items.content IS 'Contenu textuel de la pépite (résumé, citation, notes personnelles)';
COMMENT ON COLUMN items.slug IS 'Version URL-friendly du titre pour le SEO et les routes';
COMMENT ON COLUMN items.thumbnail_url IS 'URL de l image stockée sur service externe (Cloudinary/Supabase)';
COMMENT ON COLUMN items.metadata IS 'Métadonnées flexibles en JSONB : {"isbn": "xxx", source_url": "xxx", "duration": "45min", "channel": "xxx", "coordinates": {...}}';

-- Application du trigger
CREATE TRIGGER set_timestamp_items BEFORE UPDATE ON items FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
