-- ============================================================================
-- SEEDER 01 : UTILISATEURS
-- Fichier: database/seeders/01_add_users_seeders.sql
-- ============================================================================

-- Nettoyage préalable (si nécessaire)
TRUNCATE TABLE users CASCADE;

-- ============================================================================
-- SUPER ADMINS (3)
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

INSERT INTO users (
    id_user,
    email,
    password_hash,
    pseudo,
    role_name,
    auth_provider,
    settings_user,
    gdpr_consent,
    gdpr_consent_date
) VALUES
(
    '018d5c8e-1234-7001-8001-000000000001',
    'admin.master@memoria.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW', -- password: SuperAdmin123!
    'MasterAdmin',
    'super_admin',
    'local',
    '{"theme": "dark", "language": "fr", "notifications": true, "emailDigest": "weekly"}',
    true,
    '2026-01-15 08:00:00'
),
(
    '018d5c8e-1234-7001-8001-000000000002',
    'security.admin@memoria.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'SecurityChief',
    'super_admin',
    'local',
    '{"theme": "light", "language": "en", "notifications": true, "emailDigest": "daily"}',
    true,
    '2026-01-15 08:15:00'
),
(
    '018d5c8e-1234-7001-8001-000000000003',
    'tech.lead@memoria.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'TechGuru',
    'super_admin',
    'google',
    '{"theme": "dark", "language": "fr", "notifications": false, "emailDigest": "never"}',
    true,
    '2026-01-15 08:30:00'
);

-- ============================================================================
-- ADMINS (3)
-- ============================================================================

INSERT INTO users (
    id_user,
    email,
    password_hash,
    pseudo,
    role_name,
    auth_provider,
    settings_user,
    gdpr_consent,
    gdpr_consent_date
) VALUES
(
    '018d5c8e-1234-7001-8002-000000000001',
    'support@memoria.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'SupportTeam',
    'admin',
    'local',
    '{"theme": "light", "language": "fr", "notifications": true, "emailDigest": "daily"}',
    true,
    '2026-01-15 09:00:00'
),
(
    '018d5c8e-1234-7001-8002-000000000002',
    'content.moderator@memoria.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'ModTeam',
    'admin',
    'local',
    '{"theme": "dark", "language": "en", "notifications": true, "emailDigest": "weekly"}',
    true,
    '2026-01-15 09:15:00'
),
(
    '018d5c8e-1234-7001-8002-000000000003',
    'data.analyst@memoria.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'DataWizard',
    'admin',
    'azure',
    '{"theme": "light", "language": "fr", "notifications": false, "emailDigest": "monthly"}',
    true,
    '2026-01-15 09:30:00'
);

-- ============================================================================
-- CUSTOMERS / UTILISATEURS REGULIERS (12)
-- ============================================================================

INSERT INTO users (
    id_user,
    email,
    password_hash,
    pseudo,
    role_name,
    auth_provider,
    settings_user,
    gdpr_consent,
    gdpr_consent_date
) VALUES
-- Utilisateur 1 : Développeur passionné
(
    '018d5c8e-5678-7001-9001-000000000001',
    'sophie.durant@email.fr',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'SophieDev',
    'customer',
    'local',
    '{"theme": "dark", "language": "fr", "notifications": true, "emailDigest": "weekly"}',
    true,
    '2026-01-15 10:00:00'
),
-- Utilisateur 2 : Chef de projet digital
(
    '018d5c8e-5678-7001-9001-000000000002',
    'marc.lefebvre@email.fr',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'MarcPM',
    'customer',
    'google',
    '{"theme": "light", "language": "fr", "notifications": true, "emailDigest": "daily"}',
    true,
    '2026-01-15 10:30:00'
),
-- Utilisateur 3 : Étudiante en psychologie
(
    '018d5c8e-5678-7001-9001-000000000003',
    'emma.martin@student.edu',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'EmmaPsy',
    'customer',
    'local',
    '{"theme": "light", "language": "fr", "notifications": false, "emailDigest": "weekly"}',
    true,
    '2026-01-15 11:00:00'
),
-- Utilisateur 4 : Designer UX/UI
(
    '018d5c8e-5678-7001-9001-000000000004',
    'lucas.designer@creative.io',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'LucasDesign',
    'customer',
    'apple',
    '{"theme": "dark", "language": "en", "notifications": true, "emailDigest": "never"}',
    true,
    '2026-01-15 11:30:00'
),
-- Utilisateur 5 : Entrepreneur
(
    '018d5c8e-5678-7001-9001-000000000005',
    'alice.entrepreneur@startup.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'AliceCEO',
    'customer',
    'google',
    '{"theme": "light", "language": "en", "notifications": true, "emailDigest": "daily"}',
    true,
    '2026-01-15 12:00:00'
),
-- Utilisateur 6 : Professeur de philosophie
(
    '018d5c8e-5678-7001-9001-000000000006',
    'paul.philo@university.edu',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'ProfPaul',
    'customer',
    'local',
    '{"theme": "light", "language": "fr", "notifications": false, "emailDigest": "monthly"}',
    true,
    '2026-01-15 12:30:00'
),
-- Utilisateur 7 : Journaliste tech
(
    '018d5c8e-5678-7001-9001-000000000007',
    'julie.tech@press.media',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'JulieTech',
    'customer',
    'local',
    '{"theme": "dark", "language": "fr", "notifications": true, "emailDigest": "daily"}',
    true,
    '2026-01-15 13:00:00'
),
-- Utilisateur 8 : Chef cuisinier
(
    '018d5c8e-5678-7001-9001-000000000008',
    'thomas.chef@restaurant.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'ChefThomas',
    'customer',
    'google',
    '{"theme": "light", "language": "fr", "notifications": true, "emailDigest": "weekly"}',
    true,
    '2026-01-15 13:30:00'
),
-- Utilisateur 9 : Architecte
(
    '018d5c8e-5678-7001-9001-000000000009',
    'camille.archi@studio.fr',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'CamilleArchi',
    'customer',
    'azure',
    '{"theme": "dark", "language": "fr", "notifications": false, "emailDigest": "weekly"}',
    true,
    '2026-01-15 14:00:00'
),
-- Utilisateur 10 : Musicien
(
    '018d5c8e-5678-7001-9001-000000000010',
    'maxime.music@sound.io',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'MaxMusic',
    'customer',
    'local',
    '{"theme": "dark", "language": "en", "notifications": true, "emailDigest": "never"}',
    true,
    '2026-01-15 14:30:00'
),
-- Utilisateur 11 : Data scientist
(
    '018d5c8e-5678-7001-9001-000000000011',
    'lea.data@analytics.com',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'LeaData',
    'customer',
    'google',
    '{"theme": "light", "language": "en", "notifications": true, "emailDigest": "weekly"}',
    true,
    '2026-01-15 15:00:00'
),
-- Utilisateur 12 : Écrivain
(
    '018d5c8e-5678-7001-9001-000000000012',
    'pierre.writer@books.fr',
    '$2b$10$YQmH3kN5zK8vP2xL9wR8ueO5pN3jF6tB4sY7qA1rE2nD8vK5mC3xW',
    'PierreWriter',
    'customer',
    'local',
    '{"theme": "light", "language": "fr", "notifications": false, "emailDigest": "monthly"}',
    true,
    '2026-01-15 15:30:00'
);



