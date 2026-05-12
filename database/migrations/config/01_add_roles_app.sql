-- ============================================================================
-- TODO ÉTAPE 2 (DCL) : SÉCURISATION ET RÔLES (à exécuter avec le rôle postgres)
-- ============================================================================

-- Création du rôle applicatif (SANS mot de passe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'app_memoria'
    ) THEN
        CREATE ROLE app_memoria LOGIN;
    END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO app_memoria;
