-- ============================================================================
-- ÉTAPE 3-B : TYPES ÉNUMÉRÉS (100% SAFE RAILWAY)
-- ============================================================================

SET search_path TO public;

-- ============================================================================
-- ROLE ENUM
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'role_enum'
        AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.role_enum AS ENUM (
            'admin',
            'customer',
            'super_admin'
        );
    END IF;
END
$$;

COMMENT ON TYPE public.role_enum IS
'Rôles des utilisateurs pour la gestion des droits Access Control Level (ACL)';

-- ============================================================================
-- AUTH PROVIDER ENUM
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'auth_provider_enum'
        AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.auth_provider_enum AS ENUM (
            'local',
            'google',
            'azure',
            'apple'
        );
    END IF;
END
$$;

COMMENT ON TYPE public.auth_provider_enum IS
'Fournisseur d authentification';

-- ============================================================================
-- CONTENT TYPE ENUM
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'content_type_enum'
        AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.content_type_enum AS ENUM (
            'livre',
            'podcast',
            'article',
            'video',
            'note'
        );
    END IF;
END
$$;

COMMENT ON TYPE public.content_type_enum IS
'Types de contenu';

-- ============================================================================
-- EVENT CATEGORY ENUM
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'event_category_enum'
        AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.event_category_enum AS ENUM (
            'analytics',
            'audit',
            'monitoring',
            'gdpr'
        );
    END IF;
END
$$;

COMMENT ON TYPE public.event_category_enum IS
'Catégories principales des événements système';

-- ============================================================================
-- SEVERITY ENUM
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'severity_enum'
        AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.severity_enum AS ENUM (
            'info',
            'warning',
            'error',
            'critical'
        );
    END IF;
END
$$;

COMMENT ON TYPE public.severity_enum IS
'Niveaux de gravité pour les événements de type monitoring/audit';
