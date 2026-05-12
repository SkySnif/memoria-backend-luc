-- ============================================
-- 🔐 Permissions for app_memoria
-- ============================================

-- Accès au schéma
GRANT USAGE ON SCHEMA public TO app_memoria;

-- Tables EXISTANTES
GRANT
    SELECT,
    INSERT,
    UPDATE,
    DELETE
ON ALL TABLES IN SCHEMA public
TO app_memoria;

-- Séquences EXISTANTES
GRANT
    USAGE,
    SELECT
ON ALL SEQUENCES IN SCHEMA public
TO app_memoria;

-- Tables FUTURES créées par postgres
ALTER DEFAULT PRIVILEGES
FOR ROLE postgres
IN SCHEMA public
GRANT
    SELECT,
    INSERT,
    UPDATE,
    DELETE
ON TABLES
TO app_memoria;

-- Séquences FUTURES créées par postgres
ALTER DEFAULT PRIVILEGES
FOR ROLE postgres
IN SCHEMA public
GRANT
    USAGE,
    SELECT
ON SEQUENCES
TO app_memoria;
