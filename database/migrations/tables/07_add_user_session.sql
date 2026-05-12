-- database/migrations/tables/07_add_user_sessions_table.sql

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

DO $$
BEGIN
    -- Il faut spécifier le schéma explicitement avec pg_catalog.pg_tables
    -- et s'assurer que le nom du schéma est comparé correctement.
    -- Le standard est `public` sans guillemets, mais parfois il faut être plus précis.
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_catalog.pg_tables
        WHERE  schemaname = 'public' -- Utilisation de guillemets simples pour une chaîne littérale SQL
        AND    tablename = 'user_sessions'
    ) THEN
        CREATE TABLE user_sessions (
            sid VARCHAR PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP(6) NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions(expire);
        RAISE NOTICE 'Table "user_sessions" créée.';
    END IF;
END
$$;
