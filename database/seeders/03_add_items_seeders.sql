-- ============================================================================
-- SEEDER 03 : ITEMS (PÉPITES)
-- Fichier: database/seeders/03_add_items_seeders.sql
-- ============================================================================

-- Nettoyage préalable
TRUNCATE TABLE items CASCADE;

-- ============================================================================
-- ITEMS POUR SOPHIE (Développeuse) - 8 pépites
-- ID pattern : 018d5c8e-8001-7001-b001-00000000000X
-- ============================================================================

-- Forcer l'encodage client
SET CLIENT_ENCODING TO 'UTF8';

INSERT INTO items (
    id_item,
    user_id,
    content_type,
    title,
    slug,
    content,
    thumbnail_url,
    source_author,
    metadata
) VALUES
(
    '018d5c8e-8001-7001-b001-000000000001',
    '018d5c8e-5678-7001-9001-000000000001',
    'article',
    'Les principes SOLID en JavaScript',
    'les-principes-solid-en-javascript',
    'Les principes SOLID sont essentiels pour écrire du code maintenable. Single Responsibility : une classe = une responsabilité. Open/Closed : ouvert à l''extension, fermé à la modification. Liskov Substitution : les sous-types doivent être substituables. Interface Segregation : pas d''interfaces trop larges. Dependency Inversion : dépendre des abstractions.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    'Martin Fowler',
    '{"reading_time": "8 min", "difficulty": "intermediate", "language": "fr", "source_url": "https://dev.to/solid-principles-js"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000002',
    '018d5c8e-5678-7001-9001-000000000001',
    'video',
    'React Server Components expliqués',
    'react-server-components-expliques',
    'Les RSC permettent de rendre des composants côté serveur sans envoyer le JS au client. Avantages : bundle plus léger, meilleure performance, accès direct à la DB. À utiliser pour les composants statiques ou avec peu d''interactivité.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    'Vercel Team',
    '{"duration": "25:30", "platform": "YouTube", "channel": "Vercel", "source_url": "https://youtube.com/watch?v=react-rsc-2026"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000003',
    '018d5c8e-5678-7001-9001-000000000001',
    'livre',
    'Clean Architecture - Robert C. Martin',
    'clean-architecture-robert-c-martin',
    'L''architecture propre sépare les préoccupations en couches : Entities (règles métier), Use Cases (logique applicative), Interface Adapters (controllers, gateways), Frameworks (détails). La règle de dépendance : les couches internes ne connaissent pas les couches externes.',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    'Robert C. Martin',
    '{"isbn": "978-0134494166", "pages": 432, "year": 2017, "publisher": "Prentice Hall", "source_url": "https://www.amazon.fr/clean-architecture"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000004',
    '018d5c8e-5678-7001-9001-000000000001',
    'article',
    'PostgreSQL : Optimisation des index',
    'postgresql-optimisation-des-index',
    'Un index B-tree est optimal pour les égalités et ranges. Les index partiels (WHERE clause) économisent de l''espace. EXPLAIN ANALYZE pour mesurer les performances. Attention au sur-indexage qui ralentit les writes. Les index sur expressions permettent des recherches complexes.',
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d',
    'PostgreSQL Documentation',
    '{"version": "16", "reading_time": "12 min", "difficulty": "advanced", "source_url": "https://postgresql.org/docs/indexes"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000005',
    '018d5c8e-5678-7001-9001-000000000001',
    'podcast',
    'Architecture hexagonale en pratique',
    'architecture-hexagonale-en-pratique',
    'L''architecture hexagonale (Ports & Adapters) isole la logique métier. Les ports définissent les interfaces, les adapters implémentent les détails (DB, API). Avantage : testabilité maximale, changement de framework facilité. Exemple concret avec Node.js et Express.',
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618',
    'Software Engineering Daily',
    '{"duration": "45:00", "episode": 42, "season": 3, "platform": "Spotify", "source_url": "https://podcast.com/hexagonal-architecture"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000006',
    '018d5c8e-5678-7001-9001-000000000001',
    'article',
    'JWT : Sécurité et bonnes pratiques',
    'jwt-securite-et-bonnes-pratiques',
    'Ne jamais stocker de données sensibles dans le payload (c''est décodable !). Utiliser HTTPS obligatoirement. Durée de vie courte (15-30 min) + refresh token. Vérifier la signature côté serveur. Stocker en httpOnly cookie, pas en localStorage. Implémenter une blacklist pour la déconnexion.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    'Auth0 Team',
    '{"reading_time": "10 min", "security_level": "critical", "updated": "2026-01", "source_url": "https://auth0.com/blog/jwt-security"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000007',
    '018d5c8e-5678-7001-9001-000000000001',
    'note',
    'DevOps : Pipeline CI/CD minimal',
    'devops-pipeline-ci-cd-minimal',
    'Mon setup minimal : 1) Tests unitaires automatiques sur chaque commit. 2) Build Docker si tests OK. 3) Deploy auto sur staging. 4) Tests E2E sur staging. 5) Deploy manuel sur prod après validation. Outils : GitHub Actions + Docker + Railway. Temps total : ~8 min.',
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9',
    'My Self',
    '{"tools": ["GitHub Actions", "Docker", "Railway"], "cost": "0€/mois"}'::jsonb
),
(
    '018d5c8e-8001-7001-b001-000000000008',
    '018d5c8e-5678-7001-9001-000000000001',
    'video',
    'Node.js : Event Loop expliqué visuellement',
    'nodejs-event-loop-explique-visuellement',
    'L''Event Loop gère l''asynchrone en 6 phases : timers, pending callbacks, idle/prepare, poll, check, close callbacks. Le poll attend les I/O. setImmediate s''exécute après poll. process.nextTick a la priorité absolue. Comprendre ça évite les bugs de timing.',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
    'JSConf',
    '{"duration": "18:45", "platform": "YouTube", "year": 2025, "views": "1.2M", "source_url": "https://youtube.com/watch?v=nodejs-eventloop"}'::jsonb
);

-- ============================================================================
-- ITEMS POUR MARC (Chef de projet) - 6 pépites
-- ID pattern : 018d5c8e-8001-7001-b002-00000000000X
-- ============================================================================

INSERT INTO items (
    id_item,
    user_id,
    content_type,
    title,
    slug,
    content,
    thumbnail_url,
    source_author,
    metadata
) VALUES
(
    '018d5c8e-8001-7001-b002-000000000001',
    '018d5c8e-5678-7001-9001-000000000002',
    'livre',
    'Scrum Guide officiel 2024',
    'scrum-guide-officiel-2024',
    'Les 3 piliers : Transparence, Inspection, Adaptation. Les 5 valeurs : Courage, Focus, Engagement, Respect, Ouverture. Sprint = 1-4 semaines max. Daily = 15 min debout. Sprint Review = démo. Sprint Retro = amélioration continue. Product Owner priorise, Scrum Master facilite.',
    'https://images.unsplash.com/photo-1552664730-d307ca884978',
    'Ken Schwaber & Jeff Sutherland',
    '{"version": "2024", "pages": 14, "language": "fr", "free": true, "source_url": "https://scrumguides.org/scrum-guide-2024"}'::jsonb
),
(
    '018d5c8e-8001-7001-b002-000000000002',
    '018d5c8e-5678-7001-9001-000000000002',
    'article',
    'Gérer un développeur senior difficile',
    'gerer-un-developpeur-senior-difficile',
    'Reconnaître son expertise publiquement. Lui donner de l''autonomie et des défis techniques. L''impliquer dans les décisions architecturales. Feedback en 1-1, jamais en public. Comprendre ses motivations (technique > management). Accepter son style de communication direct.',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902',
    'Julie Zhuo',
    '{"reading_time": "7 min", "category": "management", "experience_level": "intermediate", "source_url": "https://medium.com/managing-senior-devs"}'::jsonb
),
(
    '018d5c8e-8001-7001-b002-000000000003',
    '018d5c8e-5678-7001-9001-000000000002',
    'podcast',
    'OKR vs KPI : quelle différence ?',
    'okr-vs-kpi-quelle-difference',
    'KPI = indicateur de performance (mesure actuelle). OKR = Objectives & Key Results (objectif ambitieux). KPI : "Temps de réponse < 200ms". OKR : "Devenir la plateforme la plus rapide" avec KR "Réduire le temps à 100ms". Les OKR sont trimestriels et inspirants.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    'Product School',
    '{"duration": "32:15", "platform": "Apple podcasts", "rating": 4.8, "source_url": "https://podcast.com/okr-kpi-explained"}'::jsonb
),
(
    '018d5c8e-8001-7001-b002-000000000004',
    '018d5c8e-5678-7001-9001-000000000002',
    'article',
    'Réduire les réunions inutiles de 40%',
    'reduire-les-reunions-inutiles-de-40',
    'Règle 1 : Pas de réunion sans agenda partagé 24h avant. Règle 2 : Max 30 min par défaut. Règle 3 : Toujours terminer avec des action items + responsables. Règle 4 : "No meeting Wednesday". Règle 5 : Enregistrer pour les absents. Résultat : -40% de réunions en 3 mois.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    'Harvard Business Review',
    '{"reading_time": "6 min", "impact": "high", "implementation_time": "1 week", "source_url": "https://hbr.org/reduce-useless-meetings"}'::jsonb
),
(
    '018d5c8e-8001-7001-b002-000000000005',
    '018d5c8e-5678-7001-9001-000000000002',
    'video',
    'Kanban pour les équipes distribuées',
    'kanban-pour-les-equipes-distribuees',
    'Visualiser le flux : To Do, In Progress, Review, Done. Limiter le WIP (Work In Progress) : max 3 tâches par personne. Utiliser les couleurs pour la priorité. Stand-up async sur Slack. Miro ou Trello pour le board visuel. Mesurer le cycle time et le lead time.',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0',
    'Atlassian University',
    '{"duration": "22:10", "platform": "YouTube", "tools": ["Miro", "Trello", "Jira"], "source_url": "https://youtube.com/watch?v=kanban-remote"}'::jsonb
),
(
    '018d5c8e-8001-7001-b002-000000000006',
    '018d5c8e-5678-7001-9001-000000000002',
    'note',
    'Mon template de post-mortem',
    'mon-template-de-post-mortem',
    'Structure : 1) Chronologie des événements (timeline précise). 2) Impact (users affectés, durée). 3) Cause racine (5 Why). 4) Ce qui a bien marché. 5) Ce qui doit changer. 6) Action items avec responsables et deadlines. 7) Suivi dans 2 semaines. Ton bienveillant obligatoire.',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4',
    'My Self',
    '{"template_type": "incident", "team_size": "5-15", "duration": "60 min"}'::jsonb
);

-- ============================================================================
-- ITEMS POUR EMMA (Étudiante psychologie) - 7 pépites
-- ID pattern : 018d5c8e-8001-7001-b003-00000000000X
-- ============================================================================

INSERT INTO items (
    id_item,
    user_id,
    content_type,
    title,
    slug,
    content,
    thumbnail_url,
    source_author,
    metadata
) VALUES
(
    '018d5c8e-8001-7001-b003-000000000001',
    '018d5c8e-5678-7001-9001-000000000003',
    'livre',
    'Thinking, Fast and Slow - Daniel Kahneman',
    'thinking-fast-and-slow-daniel-kahneman',
    'Système 1 : rapide, automatique, émotionnel. Système 2 : lent, réfléchi, logique. Biais cognitifs : ancrage, disponibilité, confirmation. L''aversion aux pertes est plus forte que l''attrait du gain. Les décisions rationnelles nécessitent d''activer le Système 2 consciemment.',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66',
    'Daniel Kahneman',
    '{"isbn": "978-0374533557", "pages": 499, "year": 2011, "nobel_prize": true, "source_url": "https://www.amazon.fr/thinking-fast-slow"}'::jsonb
),
(
    '018d5c8e-8001-7001-b003-000000000002',
    '018d5c8e-5678-7001-9001-000000000003',
    'article',
    'La courbe de l''oubli d''Ebbinghaus',
    'la-courbe-de-oubli-ebbinghaus',
    'Sans révision, on oublie 50% après 1h, 70% après 24h. La répétition espacée combat l''oubli : réviser après 1 jour, 3 jours, 7 jours, 14 jours. Chaque répétition ancre mieux l''info. Applications : Anki, Quizlet. Idéal pour mémoriser long terme.',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    'Hermann Ebbinghaus',
    '{"year": 1885, "field": "cognitive psychology", "application": "spaced repetition", "source_url": "https://scholar.google.com/ebbinghaus-forgetting"}'::jsonb
),
(
    '018d5c8e-8001-7001-b003-000000000003',
    '018d5c8e-5678-7001-9001-000000000003',
    'video',
    'Neuroplasticité : le cerveau qui se répare',
    'neuroplasticite-le-cerveau-qui-se-repare',
    'Le cerveau peut créer de nouvelles connexions neuronales toute la vie. Exemples : récupération après AVC, apprentissage d''une langue, méditation. Facteurs clés : répétition, sommeil, attention focalisée. Les neurones qui s''activent ensemble se lient. Exercice régulier stimule la neurogenèse.',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc',
    'Andrew Huberman',
    '{"duration": "35:20", "platform": "YouTube", "lab": "Stanford", "views": "2.5M", "source_url": "https://youtube.com/watch?v=neuroplasticity-2026"}'::jsonb
),
(
    '018d5c8e-8001-7001-b003-000000000004',
    '018d5c8e-5678-7001-9001-000000000003',
    'podcast',
    'L''effet Dunning-Kruger démystifié',
    'effet-dunning-kruger-demystifie',
    'Les débutants surestiment leur compétence (pic de confiance). Les experts sous-estiment (syndrome de l''imposteur). La courbe : 1) Ignorance confiante, 2) Vallée du désespoir, 3) Pente de l''illumination, 4) Plateau de la maîtrise. Important pour l''auto-évaluation.',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
    'Hidden Brain NPR',
    '{"duration": "28:40", "platform": "Spotify", "year": 2025, "episode": 142, "source_url": "https://podcast.com/dunning-kruger"}'::jsonb
),
(
    '018d5c8e-8001-7001-b003-000000000005',
    '018d5c8e-5678-7001-9001-000000000003',
    'article',
    'Pomodoro : la science derrière la technique',
    'pomodoro-la-science-derriere-la-technique',
    '25 min de focus intense + 5 min de pause. Pourquoi ça marche : notre attention décline après 25 min. Les pauses préviennent la fatigue cognitive. Après 4 pomodoros : pause de 15-30 min. La timeboxing réduit la procrastination. Apps : Forest, Focus To-Do.',
    'https://images.unsplash.com/photo-1611262588024-d12430b98920',
    'Francesco Cirillo',
    '{"technique_year": 1987, "reading_time": "5 min", "evidence_based": true, "source_url": "https://psychology.org/pomodoro-research"}'::jsonb
),
(
    '018d5c8e-8001-7001-b003-000000000006',
    '018d5c8e-5678-7001-9001-000000000003',
    'note',
    'Ma méthode Zettelkasten simplifiée',
    'ma-methode-zettelkasten-simplifiee',
    'Principe : chaque note = 1 idée atomique. Lier les notes entre elles (pas de dossiers !). 3 types : notes de lecture, notes permanentes, notes de projet. Utiliser des tags légers. L''important c''est les connexions, pas l''organisation. Outil : Obsidian avec graph view.',
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57',
    'My Self',
    '{"method": "Zettelkasten", "tool": "Obsidian", "daily_time": "15 min"}'::jsonb
),
(
    '018d5c8e-8001-7001-b003-000000000007',
    '018d5c8e-5678-7001-9001-000000000003',
    'livre',
    'L''art de la mémoire - Frances Yates',
    'art-de-la-memoire-frances-yates',
    'Technique du palais mental : associer des infos à des lieux familiers. Les Grecs anciens mémorisaient des discours entiers. Créer des images mentales bizarres et émotionnelles. Parcourir mentalement les pièces pour récupérer l''info. Utilisé par les champions de mémoire modernes.',
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090',
    'Frances Yates',
    '{"isbn": "978-0226950013", "pages": 400, "year": 1966, "field": "history", "source_url": "https://www.amazon.fr/art-memoire-yates"}'::jsonb
);

-- ============================================================================
-- ITEMS POUR ALICE (Designer UX/UI) - 8 pépites
-- ID pattern : 018d5c8e-8001-7001-b004-00000000000X
-- ============================================================================

INSERT INTO items (
    id_item,
    user_id,
    content_type,
    title,
    slug,
    content,
    thumbnail_url,
    source_author,
    metadata
) VALUES
(
    '018d5c8e-8001-7001-b004-000000000001',
    '018d5c8e-5678-7001-9001-000000000004',
    'article',
    'Atomic Design : méthodologie complète',
    'atomic-design-methodologie-complete',
    'Hiérarchie en 5 niveaux : Atomes (boutons, inputs), Molécules (champ de recherche), Organismes (header), Templates (wireframes), Pages (instances finales). Permet la cohérence et la réutilisabilité. Penser composants avant pages. Facilite la collaboration dev-design.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    'Brad Frost',
    '{"reading_time": "12 min", "methodology": "Atomic Design", "year": 2013, "source_url": "https://atomicdesign.bradfrost.com"}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000002',
    '018d5c8e-5678-7001-9001-000000000004',
    'video',
    'Figma : Auto Layout et Variants avancés',
    'figma-auto-layout-et-variants-avances',
    'Auto Layout = flexbox dans Figma. Permet le responsive automatique. Les Variants gèrent les états (hover, active, disabled). Combiner les deux pour des composants robustes. Nommer les propriétés clairement. Utiliser la shared library pour la cohérence équipe.',
    'https://images.unsplash.com/photo-1609921212029-bb5a28e60960',
    'Figma Official',
    '{"duration": "18:25", "platform": "YouTube", "level": "advanced", "source_url": "https://youtube.com/watch?v=figma-variants"}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000003',
    '018d5c8e-5678-7001-9001-000000000004',
    'livre',
    'Don''t Make Me Think - Steve Krug',
    'dont-make-me-think-steve-krug',
    'Principe #1 : Ne me faites pas réfléchir. Les utilisateurs scannent, ne lisent pas. Éliminez les mots inutiles. Navigation claire. Tester avec 3-5 users suffit. Les conventions web sont nos amies. La page d''accueil doit répondre à "Où suis-je ? Par où commencer ?".',
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb',
    'Steve Krug',
    '{"isbn": "978-0321965516", "pages": 216, "year": 2014, "edition": 3, "source_url": "https://www.amazon.fr/dont-make-me-think"}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000004',
    '018d5c8e-5678-7001-9001-000000000004',
    'article',
    'Accessibilité : WCAG 2.1 en pratique',
    'accessibilite-wcag-2-1-en-pratique',
    'Contraste minimum 4.5:1 pour le texte. Toutes les fonctions au clavier. Alt text pour les images. Labels sur les formulaires. Focus visible. Structure sémantique HTML. Tester avec screen reader. Les sous-titres pour vidéos. Ne pas se fier qu''à la couleur.',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6',
    'W3C',
    '{"level": "AA", "wcag_version": "2.1", "reading_time": "15 min", "source_url": "https://w3.org/WAI/WCAG21/quickref"}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000005',
    '018d5c8e-5678-7001-9001-000000000004',
    'podcast',
    'Design System : de zéro à la production',
    'design-system-de-zero-a-la-production',
    'Commencer petit : couleurs, typo, spacing. Documenter en même temps que la création. Impliquer les devs dès le début. Nommer avec une logique claire (primary, secondary, pas bleu, rouge). Versionner le DS. Avoir une équipe dédiée ou des champions. Mesurer l''adoption.',
    'https://images.unsplash.com/photo-1558655146-d09347e92766',
    'Design Systems podcast',
    '{"duration": "42:00", "platform": "Spotify", "guests": ["Brad Frost"], "source_url": "https://podcast.com/design-systems"}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000006',
    '018d5c8e-5678-7001-9001-000000000004',
    'note',
    'Ma checklist UX avant livraison',
    'ma-checklist-ux-avant-livraison',
    'États vides, loading, erreurs définis. Responsive mobile/tablet/desktop. Focus states visibles. Messages d''erreur explicites. Feedback visuel sur les actions. Performance : First Contentful Paint < 1.8s. Micro-interactions cohérentes. Tests avec 5 users minimum.',
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d',
    'My Self',
    '{"checklist_items": 12, "time_needed": "30 min", "critical": true}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000007',
    '018d5c8e-5678-7001-9001-000000000004',
    'article',
    'Loi de Fitts appliquée aux interfaces',
    'loi-de-fitts-appliquee-aux-interfaces',
    'Le temps pour atteindre une cible = fonction de la distance et de la taille. Boutons importants = plus gros. Actions fréquentes = accessibles rapidement. Coins d''écran = zones infinies (faciles à atteindre). Grouper les éléments liés. Menu burger : pratique mais caché.',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3',
    'Paul Fitts',
    '{"law_year": 1954, "field": "ergonomics", "reading_time": "6 min", "source_url": "https://lawsofux.com/fittss-law"}'::jsonb
),
(
    '018d5c8e-8001-7001-b004-000000000008',
    '018d5c8e-5678-7001-9001-000000000004',
    'video',
    'Prototypage rapide avec Framer',
    'prototypage-rapide-avec-framer',
    'Framer = design + code. Composants React intégrés. Animations fluides avec spring physics. Variables pour les variants. Connecter à des vraies APIs. Publier en un clic. Code exportable. Idéal pour tester des micro-interactions complexes.',
    'https://images.unsplash.com/photo-1559028012-481c04fa702d',
    'Framer Team',
    '{"duration": "14:30", "platform": "YouTube", "tool_version": "2026.1", "source_url": "https://youtube.com/watch?v=framer-proto"}'::jsonb
);
