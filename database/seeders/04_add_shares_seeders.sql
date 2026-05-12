-- ============================================================================
-- SEEDER 04 : SHARES (PARTAGES) - CORRIGÉ
-- Fichier: database/seeders/04_add_shares_seeders.sql
-- ============================================================================

-- Nettoyage préalable
TRUNCATE TABLE shares CASCADE;

-- ============================================================================
-- PARTAGES DE SOPHIE (Développeuse)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

INSERT INTO
    shares (
        id_share,
        item_id,
        recipient_email,
        share_token,
        access_config
    )
VALUES (
        '018d5c8e-9001-7001-c001-000000000001',
        '018d5c8e-8001-7001-b001-000000000003', -- Clean Architecture
        'marc.dubois@entreprise.fr',
        'tok_share_sophie_marc_001',
        '{"level": "read", "allow_download": false, "expiration": null, "shared_at": "2026-01-05T14:30:00Z"}'::jsonb
    ),
    (
        '018d5c8e-9001-7001-c001-000000000002',
        '018d5c8e-8001-7001-b001-000000000002', -- React Server Components
        'alice.martin@design.com',
        'tok_share_sophie_alice_001',
        '{"level": "read", "allow_download": true, "expiration": "2026-03-01", "shared_at": "2026-01-07T10:15:00Z"}'::jsonb
    ),
    (
        '018d5c8e-9001-7001-c001-000000000003',
        '018d5c8e-8001-7001-b001-000000000006', -- JWT Sécurité
        'thomas.roux@startup.io',
        'tok_share_sophie_thomas_001',
        '{"level": "read", "allow_download": false, "expiration": "2026-02-15", "shared_at": "2026-01-06T16:45:00Z"}'::jsonb
    );

-- ============================================================================
-- PARTAGES DE MARC (Chef de projet)
-- ============================================================================

INSERT INTO
    shares (
        id_share,
        item_id,
        recipient_email,
        share_token,
        access_config
    )
VALUES (
        '018d5c8e-9001-7001-c002-000000000001',
        '018d5c8e-8001-7001-b002-000000000001', -- Scrum Guide officiel
        'sophie.laurent@tech.io',
        'tok_share_marc_sophie_001',
        '{"level": "read", "allow_download": true, "expiration": null, "shared_at": "2026-01-04T09:20:00Z"}'::jsonb
    ),
    (
        '018d5c8e-9001-7001-c002-000000000002',
        '018d5c8e-8001-7001-b002-000000000006', -- Template post-mortem
        'julie.bernard@agency.fr',
        'tok_share_marc_julie_001',
        '{"level": "read", "allow_download": false, "expiration": "2026-02-28", "shared_at": "2026-01-08T11:20:00Z"}'::jsonb
    ),
    (
        '018d5c8e-9001-7001-c002-000000000003',
        '018d5c8e-8001-7001-b002-000000000004', -- OKR Framework
        'paul.martin@corp.com',
        'tok_share_marc_paul_001',
        '{"level": "read", "allow_download": false, "expiration": "2026-01-31", "shared_at": "2026-01-07T15:30:00Z"}'::jsonb
    );
