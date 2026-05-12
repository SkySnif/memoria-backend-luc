-- ============================================================================
-- SUPPRESSION DE TOUTES LES TYPES DE LA BASE DE DONNEES

-- Ajoutez ici les types que vous souhaitez supprimer de la base de données
-- ============================================================================

DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS auth_provider_enum CASCADE;
DROP TYPE IF EXISTS content_type_enum CASCADE;
DROP TYPE IF EXISTS event_category_enum CASCADE;
DROP TYPE IF EXISTS severity_enum CASCADE;
