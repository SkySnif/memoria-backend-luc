-- ============================================================================
-- SEEDER 05 : ITEM_TAGS (TABLE PIVOT) - TOTALEMENT CORRIGÉ
-- Fichier: database/seeders/05_add_item_tags_seeders.sql
-- ============================================================================

-- Nettoyage préalable
TRUNCATE TABLE item_tags CASCADE;

-- ============================================================================
-- LIAISONS POUR SOPHIE (Développeuse)
-- Tags : 018d5c8e-7001-7001-a001-...
-- Items : 018d5c8e-8001-7001-b001-...
-- ============================================================================

INSERT INTO item_tags (id_tag, id_item) VALUES
-- Item 1: Les principes SOLID (JS + Clean Code)
('018d5c8e-7001-7001-a001-000000000001', '018d5c8e-8001-7001-b001-000000000001'), -- JavaScript
('018d5c8e-7001-7001-a001-000000000008', '018d5c8e-8001-7001-b001-000000000001'), -- Clean Code

-- Item 2: React Server Components (React + JavaScript)
('018d5c8e-7001-7001-a001-000000000002', '018d5c8e-8001-7001-b001-000000000002'), -- React
('018d5c8e-7001-7001-a001-000000000001', '018d5c8e-8001-7001-b001-000000000002'), -- JavaScript

-- Item 3: Clean Architecture (Architecture + Clean Code)
('018d5c8e-7001-7001-a001-000000000005', '018d5c8e-8001-7001-b001-000000000003'), -- Architecture
('018d5c8e-7001-7001-a001-000000000008', '018d5c8e-8001-7001-b001-000000000003'), -- Clean Code

-- Item 4: PostgreSQL Index (PostgreSQL)
('018d5c8e-7001-7001-a001-000000000004', '018d5c8e-8001-7001-b001-000000000004'), -- PostgreSQL

-- Item 5: Architecture Hexagonale (Architecture + Node.js)
('018d5c8e-7001-7001-a001-000000000005', '018d5c8e-8001-7001-b001-000000000005'), -- Architecture
('018d5c8e-7001-7001-a001-000000000003', '018d5c8e-8001-7001-b001-000000000005'), -- Node.js

-- Item 6: JWT Sécurité (Sécurité + Node.js)
('018d5c8e-7001-7001-a001-000000000007', '018d5c8e-8001-7001-b001-000000000006'), -- Sécurité
('018d5c8e-7001-7001-a001-000000000003', '018d5c8e-8001-7001-b001-000000000006'), -- Node.js

-- Item 7: DevOps Pipeline (DevOps)
('018d5c8e-7001-7001-a001-000000000006', '018d5c8e-8001-7001-b001-000000000007'), -- DevOps

-- Item 8: Node.js Event Loop (Node.js + JavaScript)
('018d5c8e-7001-7001-a001-000000000003', '018d5c8e-8001-7001-b001-000000000008'), -- Node.js
('018d5c8e-7001-7001-a001-000000000001', '018d5c8e-8001-7001-b001-000000000008'); -- JavaScript


-- ============================================================================
-- LIAISONS POUR MARC (Chef de projet)
-- Tags : 018d5c8e-7001-7001-a002-...
-- Items : 018d5c8e-8001-7001-b002-...
-- ============================================================================

INSERT INTO item_tags (id_tag, id_item) VALUES
-- Item 1: Scrum Guide (Scrum + Agile)
('018d5c8e-7001-7001-a002-000000000003', '018d5c8e-8001-7001-b002-000000000001'), -- Scrum
('018d5c8e-7001-7001-a002-000000000002', '018d5c8e-8001-7001-b002-000000000001'), -- Agile

-- Item 2: Gérer dev senior (Leadership + Communication)
('018d5c8e-7001-7001-a002-000000000004', '018d5c8e-8001-7001-b002-000000000002'), -- Leadership
('018d5c8e-7001-7001-a002-000000000005', '018d5c8e-8001-7001-b002-000000000002'), -- Communication

-- Item 3: OKR vs KPI (Gestion de projet)
('018d5c8e-7001-7001-a002-000000000001', '018d5c8e-8001-7001-b002-000000000003'), -- Gestion de projet

-- Item 4: Réduire réunions (Productivité)
('018d5c8e-7001-7001-a002-000000000006', '018d5c8e-8001-7001-b002-000000000004'), -- Productivité

-- Item 5: Kanban (Agile + Productivité)
('018d5c8e-7001-7001-a002-000000000002', '018d5c8e-8001-7001-b002-000000000005'), -- Agile
('018d5c8e-7001-7001-a002-000000000006', '018d5c8e-8001-7001-b002-000000000005'), -- Productivité

-- Item 6: Template post-mortem (Gestion de projet)
('018d5c8e-7001-7001-a002-000000000001', '018d5c8e-8001-7001-b002-000000000006'); -- Gestion de projet


-- ============================================================================
-- LIAISONS POUR EMMA (Psychologie)
-- Tags : 018d5c8e-7001-7001-a003-...
-- Items : 018d5c8e-8001-7001-b003-...
-- ============================================================================

INSERT INTO item_tags (id_tag, id_item) VALUES
-- Item 1: Thinking Fast and Slow (Psychologie cognitive)
('018d5c8e-7001-7001-a003-000000000001', '018d5c8e-8001-7001-b003-000000000001'), -- Psychologie cognitive

-- Item 2: Courbe de l'oubli (Mémoire + Apprentissage)
('018d5c8e-7001-7001-a003-000000000003', '018d5c8e-8001-7001-b003-000000000002'), -- Mémoire
('018d5c8e-7001-7001-a003-000000000004', '018d5c8e-8001-7001-b003-000000000002'), -- Apprentissage

-- Item 3: Neuroplasticité (Neurosciences)
('018d5c8e-7001-7001-a003-000000000002', '018d5c8e-8001-7001-b003-000000000003'), -- Neurosciences

-- Item 4: Dunning-Kruger (Psychologie cognitive + Apprentissage)
('018d5c8e-7001-7001-a003-000000000001', '018d5c8e-8001-7001-b003-000000000004'), -- Psychologie cognitive
('018d5c8e-7001-7001-a003-000000000004', '018d5c8e-8001-7001-b003-000000000004'), -- Apprentissage

-- Item 5: Pomodoro (Productivité / Études)
('018d5c8e-7001-7001-a003-000000000006', '018d5c8e-8001-7001-b003-000000000005'), -- Études

-- Item 6: Zettelkasten (Mémoire + Apprentissage)
('018d5c8e-7001-7001-a003-000000000003', '018d5c8e-8001-7001-b003-000000000006'), -- Mémoire
('018d5c8e-7001-7001-a003-000000000004', '018d5c8e-8001-7001-b003-000000000006'), -- Apprentissage

-- Item 7: L'art de la mémoire (Mémoire + Histoire)
('018d5c8e-7001-7001-a003-000000000003', '018d5c8e-8001-7001-b003-000000000007'); -- Mémoire
