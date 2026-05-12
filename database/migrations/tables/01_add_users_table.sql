-- ============================================================================
-- TODO ÉTAPE 5.1 : TABLE 1 -> USERS (Utilisateurs) (DDL)

-- Relation Merise : Entité indépendante
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

CREATE TABLE IF NOT EXISTS users (
    id_user UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pseudo CITEXT UNIQUE NOT NULL,
    role_name role_enum NOT NULL DEFAULT 'customer',
    auth_provider auth_provider_enum NOT NULL DEFAULT 'local',
    settings_user JSONB NOT NULL DEFAULT '{}',
    gdpr_consent BOOLEAN NOT NULL DEFAULT FALSE,
    gdpr_consent_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NUll DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    CONSTRAINT chk_email_is_valid CHECK ( -- Contraintes métier
        email ~ '^[^@]+@[^@.]+\.[^@]+$'
    )
);

-- Indexation JSONB (Recherche rapide dans les réglages utilisateur)
CREATE INDEX IF NOT EXISTS idx_users_settings ON users USING gin (settings_user);

-- Documentation
COMMENT ON TABLE users IS 'Stocke les informations d identification et les préférences des utilisateurs (RGPD compliant)';

COMMENT ON COLUMN users.settings_user IS 'Préférences utilisateur en JSONB : {"theme": "dark", "language": "fr", "notifications": true}';

COMMENT ON COLUMN users.gdpr_consent IS 'Consentement RGPD obligatoire pour créer un compte';

COMMENT ON COLUMN users.gdpr_consent_date IS 'Date et heure précises du consentement RGPD';

-- Application du trigger
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
