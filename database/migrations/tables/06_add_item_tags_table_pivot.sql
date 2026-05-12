-- ============================================================================
-- TODO ÉTAPE 5.5 : TABLE 5 -> ITEM_TAGS (Table de liaison/pivot Many-to-Many) (DDL)

-- Relation Merise : items (0,N) --- (0,N) tags
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

CREATE TABLE IF NOT EXISTS item_tags (
    id_tag UUID REFERENCES tags (id_tag) ON DELETE CASCADE,
    id_item UUID REFERENCES items (id_item) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tag, id_item) -- Clé primaire composite (un item ne peut avoir le même tag qu'une seule fois)
);

-- Index pour requêtes inverses (tous les items d'un tag)
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags (id_tag);

-- Documentation
COMMENT ON TABLE item_tags IS 'Table de liaison gérant la relation Many-to-Many entre Items et Tags';
-- Application du trigger
