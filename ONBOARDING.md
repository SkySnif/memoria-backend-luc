# 👋 Bienvenue dans le projet Memoria — Backend

Tu reprends le développement backend de **Memoria**, l'API REST qui propulse l'app "second cerveau" (capture, organisation et partage de pépites de savoir : livres, podcasts, articles, vidéos, notes).

L'équipe précédente a migré le backend d'**Express MVC en JavaScript** vers une **API REST en TypeScript** avec architecture en couches. Le socle est solide (auth JWT, items, tags, shares, export RGPD, Swagger, tests), mais plusieurs choses restent à finir. Ce document te donne les clés pour comprendre rapidement le projet et savoir où mettre les pieds.

> 📋 La liste des tâches à reprendre est dans [`TODO.md`](./TODO.md).

## 🎯 Le produit en 30 secondes

- Une **API REST** consommée par le frontend Vue 3 (repo `memoria-frontend`)
- Authentification **JWT stateless** avec rotation des refresh tokens
- Gestion des **pépites** (5 types : livre, podcast, article, vidéo, note)
- **Tags** par utilisateur (relation many-to-many via `item_tags`)
- **Partages publics** via tokens temporaires
- **Export RGPD** complet en un endpoint (`GET /v1/users/me/export`)
- **Documentation Swagger** auto-générée sur `/docs`

## 🛠 Setup en 3 minutes

**Prérequis** : Node.js 24+, pnpm 10+, PostgreSQL 17+.

```bash
git clone <repo-url>
cd memoria-backend
pnpm install            # active aussi les hooks Husky
cp .env.example .env    # édite-le avec tes accès Postgres
pnpm gen:secrets        # génère les secrets cryptographiques
chmod +x scripts/*.sh   # une seule fois après clone
pnpm db:init            # crée la base + le rôle app_memoria
pnpm db:migrate         # joue toutes les migrations
pnpm dev
```

L'API tourne sur **http://localhost:3000**. Tu peux ouvrir :

- **http://localhost:3000/docs** → Swagger UI (toutes les routes documentées et testables depuis le navigateur)
- **http://localhost:3000/health** → ping de santé

### Compte de test (après les seeders)

Si tu as accepté l'insertion des seeders pendant `pnpm db:init` :

| Email             | Mot de passe | Rôle     |
| :---------------- | :----------- | :------- |
| `test@memoria.fr` | `TestPass1`  | customer |

Sinon, inscris-toi via `POST /v1/auth/register`.

### Tester l'auth en curl

```bash
# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@memoria.fr","password":"TestPass1"}'
# → { "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }

# Appel authentifié
curl http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## 🛠 Stack technique

| Couche            | Choix                                                | Pourquoi                                         |
| :---------------- | :--------------------------------------------------- | :----------------------------------------------- |
| Runtime           | **Node.js 24+** (ESM)                                | LTS, performances natives ESM                    |
| Langage           | **TypeScript 5.7** strict                            | Sécurité de type, refactor sûr                   |
| Serveur HTTP      | **Express 5**                                        | Gestion native des promesses async               |
| Base de données   | **PostgreSQL 17+**                                   | UUID, JSONB, ENUMs, GIN, full-text via `pg_trgm` |
| Driver DB         | **`pg`** (node-postgres)                             | SQL brut, sans ORM                               |
| Validation        | **Zod 4**                                            | Schémas runtime + types inférés                  |
| Auth              | **JWT (`jose`) + Argon2id (`@node-rs/argon2`)**      | Stateless, OWASP-recommandé                      |
| Logs              | **pino + pino-pretty (dev) + pino-roll (prod)**      | JSON structuré, rapide                           |
| Documentation API | **swagger-jsdoc + swagger-ui-express**               | OpenAPI 3 auto-généré depuis les JSDoc           |
| Tests             | **Vitest 4 + @vitest/coverage-v8**                   | Rapide, compatible TS, watch mode                |
| Lint & format     | **ESLint 9 (flat) + Prettier + Husky + lint-staged** | Hooks pour pre-commit / pre-push                 |
| Commits           | **Commitlint**                                       | Conventional commits obligatoires                |
| Package manager   | **pnpm 10+**                                         | Disk-efficient, fast install                     |

## 📁 Structure du projet

```text
memoria-backend/
├─ 💻 src/                     # Code source TypeScript
│  ├─ app.ts                   # Config Express (middlewares, routes wiring)
│  ├─ server.ts                # Point d'entrée HTTP
│  ├─ config/                  # Singletons (DatabaseConnection, LoggerSingleton, SwaggerConfig)
│  ├─ constants/               # Enums TS + schémas Zod
│  ├─ controllers/             # Handlers HTTP (parsing → service → réponse)
│  ├─ dto/                     # Data Transfer Objects (Create / Update / Response)
│  ├─ entities/                # Entités du domaine (BaseEntity, User, Item, Tag, Share)
│  ├─ exceptions/              # ApiError + factories par domaine
│  ├─ interfaces/              # Contrats pour la DI (I-préfixées)
│  ├─ middlewares/             # AuthMiddleware
│  ├─ repositories/            # Pg* (réel) + Mock* (in-memory pour tests)
│  ├─ routes/v1/               # Routers + composition root
│  ├─ services/                # Logique métier (orchestration)
│  ├─ types/                   # express.d.ts
│  └─ utils/                   # Helpers purs (SlugGenerator, TokenManager, PasswordHasher…)
│
├─ 🗄️ database/                # SQL pur
│  ├─ migrations/              # Structure (config, tables, drop)
│  ├─ seeders/                 # Données de test
│  ├─ triggers/                # Functions PL/pgSQL + triggers
│  ├─ views/                   # Vues SQL métier (v_*)
│  └─ queries/                 # SQL de référence (non joué par les migrations)
│
├─ 🔧 scripts/                 # Automatisation
│  ├─ README.md                # Doc détaillée des scripts
│  ├─ init_db.sh               # Bootstrap complet de la base
│  ├─ reset_db.sh              # Vide les tables (garde la base)
│  ├─ nuke_db.sh               # ☢️ Supprime base + rôle
│  ├─ run_sql.sh               # Run d'un fichier SQL ad hoc
│  └─ gen-secrets.js           # Génère les secrets (à migrer en .ts)
│
├─ 📚 docs/                    # Documentation interne
│  ├─ README.md                # Index
│  ├─ architecture.md          # Architecture en couches
│  ├─ backend/                 # Guides backend (01 à 08)
│  ├─ database/                # Guides PostgreSQL
│  └─ conventions/             # Style TS, organisation, git
│
├─ ONBOARDING.md               # Ce fichier
├─ TODO.md                     # Tâches à reprendre
└─ README.md                   # Présentation publique
```

## 🏗 Architecture en couches

```text
HTTP request
    ↓
Middlewares (helmet, cors, rate-limit, requestId, AuthMiddleware)
    ↓
Controller   → parse req, appelle le service, formate la réponse
    ↓
Service      → règles métier, ownership, orchestration
    ↓
Repository   → SQL via pg, mapping row ↔ entity
    ↓
PostgreSQL
```

**Règle d'or** : chaque couche dépend de la suivante **via une interface** (`IItemService`, `IItemRepository`…), jamais d'une implémentation concrète. Le câblage se fait dans **`src/routes/v1/index.ts`** (composition root) — c'est le seul fichier qui importe les classes concrètes.

Exemple concret : `POST /v1/items` →

1. `ItemController.create()` → `CreateItemSchema.parse(req.body)`
2. → `ItemService.create()` → vérifie l'unicité, génère le slug
3. → `PgItemRepository.create()` → INSERT en SQL
4. ← retour de l'entity → `ResponseItemDto` → JSON

Pour comprendre en profondeur, lis [`docs/architecture.md`](./docs/architecture.md).

## 📝 Conventions de code

Les conventions sont **enforcées automatiquement** par les hooks git (Husky) :

- À chaque **commit** → ESLint + Prettier sur les fichiers staged (`lint-staged`)
- Sur le **message de commit** → conventional commits avec scope obligatoire (`commitlint`)
- Avant chaque **push** → type-check + tests (pre-push)

Si un commit / push est refusé, lis le message d'erreur — il te dit pile ce qui cloche.

### Format de commit (obligatoire)

```text
<type>(<scope>): <subject minuscule sans point final>
```

- **type** : feat, fix, refactor, test, chore, docs, style, perf, build, ci, revert, hotfix
- **scope** : 2-25 caractères (ex: items, auth, repositories, db)
- **subject** : 10 caractères minimum, minuscule, sans point final

Exemples valides :

```text
feat(items): add tag filtering on list endpoint
fix(auth): handle expired refresh token silently
refactor(repositories): extract row-to-entity helper
docs(database): document JSONB query patterns
```

### Branches

```text
<type>/<description-kebab-case>
```

Exemples : `feat/admin-routes`, `fix/uuid-validation-400`, `refactor/n-plus-1-items`.

⚠️ Les branches `main` et `develop` sont **protégées**. Tu ne peux pas y pusher directement, tu dois passer par une PR.

## 🧪 Tests

```bash
pnpm test            # single run (utilisé par pre-push)
pnpm test:watch      # watch mode pour TDD
pnpm test:coverage   # rapport HTML dans coverage/index.html
```

Les tests sont **colocalisés** dans des dossiers `__tests__/` à côté du code testé :

```text
src/services/
├─ TagService.ts
└─ __tests__/
   └─ TagService.test.ts
```

Pas de dossier `tests/` à la racine — c'est volontaire, ça change du frontend. Plus de détails dans [`docs/conventions/02-file-organization.md`](./docs/conventions/02-file-organization.md).

Quand tu ajoutes une feature, **ajoute aussi un test** au minimum pour la logique critique (service, schémas Zod, utilitaires).

## 📖 Documentation interne

Dans `docs/`, lis dans cet ordre :

1. **[`architecture.md`](./docs/architecture.md)** — l'archi en couches expliquée
2. **[`conventions/03-git-workflow.md`](./docs/conventions/03-git-workflow.md)** — pour ne pas se faire refuser par les hooks
3. **[`backend/01-getting-started.md`](./docs/backend/01-getting-started.md)** — install + scripts
4. **[`backend/02-oop-refresher.md`](./docs/backend/02-oop-refresher.md)** — si la POO te paraît rouillée
5. **[`backend/03-database-connection.md`](./docs/backend/03-database-connection.md)** → **[`05-validation-zod.md`](./docs/backend/05-validation-zod.md)** → **[`04-error-handling.md`](./docs/backend/04-error-handling.md)** — la plomberie
6. **[`backend/06-authentication-jwt.md`](./docs/backend/06-authentication-jwt.md)** — auth et sécurité
7. **[`backend/07-testing-tdd.md`](./docs/backend/07-testing-tdd.md)** — TDD avec Vitest

Pour la base de données : **[`database/01-sql-guide.md`](./docs/database/01-sql-guide.md)** suivi des trois guides (`02`, `03`, `04`) sur JSONB, jointures et agrégation.

Pour les scripts : **[`scripts/README.md`](./scripts/README.md)**.

## 🎯 Par où commencer concrètement ?

1. **Setup + explore** — lance l'API en local, ouvre Swagger UI, teste un login en curl. Repère ce qui marche.

2. **Code-trace** un endpoint complet, par exemple `GET /v1/items` :
   - `src/routes/v1/item.ts` (la route)
   - → `src/controllers/ItemController.ts` (le handler)
   - → `src/services/ItemService.ts` (la logique)
   - → `src/repositories/PgItemRepository.ts` (le SQL)
   - → `src/entities/Item.ts` (le type domain)
   - → `src/dto/item/ResponseItemDto.ts` (la forme de sortie)

3. **Lis** au moins `docs/architecture.md` et `docs/backend/04-error-handling.md` — ils donnent le mental model.

4. **Choisis une tâche** dans [`TODO.md`](./TODO.md) et lance-toi sur une branche `feat/<ta-tâche>`.

⚠️ **Note** : il reste quelques fichiers `.js` dans `src/` (legacy de l'ancienne archi Express SSR). Leur migration vers `.ts` fait partie des tâches du TODO. Si tu en croises un, l'idée est de le porter en TypeScript en suivant les patterns du reste du codebase (classes, DI, interfaces).

Bonne route ! 🚀

---

_Dernière mise à jour : 12/05/2026_
