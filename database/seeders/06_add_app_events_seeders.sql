-- ============================================================================
-- SEEDER 06 : APP_EVENTS (ÉVÉNEMENTS SYSTÈME)
-- Fichier: database/seeders/06_add_app_events_seeders.sql
-- ============================================================================

-- Nettoyage préalable pour éviter les doublons en cas de re-seed
TRUNCATE TABLE app_events CASCADE;

-- ============================================================================
-- ÉVÉNEMENTS SYSTÈME & MONITORING (Admin focus)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

INSERT INTO
    app_events (
        id_event,
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata
    )
VALUES (
        '018d5c8e-a001-7001-d002-000000000001',
        NULL,
        'monitoring',
        'system.startup',
        'info',
        'Application Memoria démarrée avec succès',
        '{"version": "1.0.0", "environment": "production", "database": "connected", "uptime_ms": 1200}'::jsonb
    ),
    (
        '018d5c8e-a001-7001-d002-000000000002',
        NULL,
        'monitoring',
        'health.check',
        'info',
        'Vérification périodique du système OK',
        '{"latency_ms": 15, "active_connections": 4}'::jsonb
    );

-- ============================================================================
-- ÉVÉNEMENTS UTILISATEUR : SOPHIE (Développeuse - ...9001-000000000001)
-- ============================================================================

INSERT INTO
    app_events (
        id_event,
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata
    )
VALUES (
        '018d5c8e-a001-7001-d002-000000000003',
        '018d5c8e-5678-7001-9001-000000000001',
        'analytics',
        'user.registered',
        'info',
        'Nouvel utilisateur enregistré via interface locale',
        '{"method": "local", "pseudo": "SophieDev", "ip": "192.168.1.15"}'::jsonb
    ),
    (
        '018d5c8e-a001-7001-d002-000000000004',
        '018d5c8e-5678-7001-9001-000000000001',
        'analytics',
        'item.created',
        'info',
        'Ajout d''une nouvelle pépite technique',
        '{"item_id": "018d5c8e-8001-7001-b001-000000000001", "type": "article"}'::jsonb
    );

-- ============================================================================
-- ÉVÉNEMENTS SÉCURITÉ & AUDIT : EMMA (Étudiante - ...9001-000000000003)
-- ============================================================================

INSERT INTO
    app_events (
        id_event,
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata
    )
VALUES (
        '018d5c8e-a001-7001-d002-000000000010',
        '018d5c8e-5678-7001-9001-000000000003',
        'audit',
        'auth.failed',
        'warning',
        'Tentative de connexion avec mauvais mot de passe',
        '{"user_agent": "Mozilla/5.0 Chrome/120.0", "retry_count": 1}'::jsonb
    ),
    (
        '018d5c8e-a001-7001-d002-000000000011',
        '018d5c8e-5678-7001-9001-000000000003',
        'analytics',
        'user.login',
        'info',
        'Connexion réussie',
        '{"duration_ms": 450}'::jsonb
    );

-- ============================================================================
-- ÉVÉNEMENTS PROTECTION DES DONNÉES : ALICE (Entrepreneur - ...9001-000000000005)
-- ============================================================================

INSERT INTO
    app_events (
        id_event,
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata
    )
VALUES (
        '018d5c8e-a001-7001-d002-000000000020',
        '018d5c8e-5678-7001-9001-000000000005',
        'gdpr',
        'gdpr.export',
        'info',
        'Exportation complète des données utilisateur demandée',
        '{"format": "json", "request_origin": "web_dashboard"}'::jsonb
    );

-- ============================================================================
-- ERREURS SYSTÈME (Audit/Monitoring)
-- ============================================================================

INSERT INTO
    app_events (
        id_event,
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata
    )
VALUES (
        '018d5c8e-a001-7001-d002-000000000099',
        NULL,
        'monitoring',
        'db.slow_query',
        'warning',
        'Requête SQL lente détectée sur la table items',
        '{"duration_ms": 1250, "query": "SELECT * FROM items WHERE content @@ ...", "optimisation_needed": true}'::jsonb
    );
