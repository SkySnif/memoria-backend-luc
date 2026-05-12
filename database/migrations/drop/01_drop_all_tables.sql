-- ============================================================================
-- SUPPRESSION DE TOUTES LES TABLES DE LA BASE DE DONNEES
-- ============================================================================

DROP TABLE IF EXISTS user_sessions CASCADE;

-- Ensuite les tables métier dans l'ordre des dépendances
DROP TABLE IF EXISTS item_tags CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS app_events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
