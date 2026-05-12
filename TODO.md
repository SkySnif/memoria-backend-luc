# 📋 Tâches à reprendre — Memoria Backend

L'équipe précédente a migré le backend de **JavaScript Express SSR** vers une **API REST TypeScript en couches**. Les fondations sont solides mais plusieurs choses restent à finir avant la mise en prod, et tout un volet de **documentation méthodo** (Merise + UML) reste à produire.

Pour chaque tâche : **statut**, fichiers concernés, **complexité estimée** (⭐ à ⭐⭐⭐⭐⭐), et des notes pour s'orienter.

> 💡 Si tu débarques sur le projet, lis d'abord [`ONBOARDING.md`](./ONBOARDING.md).

---

## 🚧 Critique — préparation production

### Pipeline CI/CD (GitHub Actions)

- **Statut** : pas commencé
- **Complexité** : ⭐⭐⭐
- **Fichiers** : `.github/workflows/*.yml`, doc associée

Mettre en place une CI qui tourne à chaque PR sur `develop` et `main` :

- `pnpm install --frozen-lockfile`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Et un workflow de CD qui se déclenche sur `main` :

- Build Docker image
- Push vers le registry
- Déploiement sur le VPS (SSH + `docker compose up -d`)

À documenter dans un nouveau `docs/backend/09-ci-cd.md` une fois la pipeline en place.

### Dockerisation pour déploiement VPS

- **Statut** : pas commencé
- **Complexité** : ⭐⭐⭐⭐
- **Fichiers** : `Dockerfile`, `docker-compose.yml`, `.dockerignore`

Le déploiement final se fera sur un **VPS avec Docker** (plus AlwaysData). Étapes :

1. **`Dockerfile` multi-stage** : stage `build` (TypeScript → JS), stage `runtime` (Node 24 alpine, copie de `dist/` + `node_modules` prod uniquement).
2. **`docker-compose.yml`** : services `api` (l'app), `postgres` (volume persistant), `traefik` (reverse proxy + Let's Encrypt).
3. **`.dockerignore`** : exclure `node_modules`, `dist`, `coverage`, `.env`, `.git`.
4. **Health check** : Docker health check qui ping `/health` toutes les 30s.

⚠️ Le `docs/backend/08-deployment.md` actuel décrit PM2 + Traefik sans Docker — à compléter (ou réécrire) une fois le setup Docker validé. Le déploiement complet sera un **TP étudiant**.

### Configurer CORS pour le frontend

- **Statut** : pas configuré, ou config par défaut trop permissive
- **Complexité** : ⭐⭐
- **Fichiers** : `src/app.ts` (registration du middleware `cors`)

Aujourd'hui le backend doit accepter les requêtes du frontend (`memoria-frontend`). En dev c'est `http://localhost:5173`, en prod c'est l'URL du SPA déployé.

À faire :

- Ajouter une variable `CORS_ORIGIN` dans `.env` (single origin ou liste séparée par virgules)
- Configurer `cors()` avec `credentials: true` si on a besoin de cookies (sinon laisser à `false`)
- Whitelister explicitement le domaine du frontend en prod — **pas de wildcard `*`** avec credentials
- Tester un appel CORS depuis le frontend en local, puis en prod

### `gen-secrets.js` → adapter le contenu pour JWT

- **Statut** : contenu legacy
- **Complexité** : ⭐
- **Fichiers** : `scripts/gen-secrets.js`, `.env.example`, `scripts/README.md`

Le script génère encore `SESSION_SECRET` + `CSRF_SECRET` (ancienne archi Express SSR). Avec la nouvelle archi JWT, on a besoin de :

- `JWT_ACCESS_SECRET` (64 bytes hex, pour les access tokens 15min)
- `JWT_REFRESH_SECRET` (64 bytes hex, pour les refresh tokens 7j)
- `DB_PASSWORD` + `DB_APP_PASSWORD` (à conserver, toujours utiles)

À faire :

1. Remplacer `SESSION_SECRET` et `CSRF_SECRET` par les deux secrets JWT dans `gen-secrets.js`.
2. Mettre à jour `.env.example` en conséquence.
3. Mettre à jour `scripts/README.md` (la section actuelle dit "legacy, à mettre à jour").

> ℹ️ **Pas besoin de migrer le script en TypeScript** — il vit dans `scripts/`, hors de `src/`. La migration JS → TS ne concerne que le code applicatif sous `src/`. Les scripts d'automatisation peuvent rester en JS sans souci.

---

## 📐 Documentation manquante — Merise + UML

> Pour que ce projet soit considéré comme **pro-grade**, il manque toute la couche de documentation méthodologique. Le code et la doc technique sont là, mais pas les modèles conceptuels qui permettent de comprendre le métier sans lire le code.

### MCD — Modèle Conceptuel de Données

- **Statut** : pas fait
- **Complexité** : ⭐⭐
- **Fichiers** : `docs/database/assets/01-mcd.png` (ou `.svg`) + source `.puml` ou `.drawio`

Représentation conceptuelle des entités (User, Item, Tag, Share, AppEvent) avec leurs associations et cardinalités, **indépendamment de toute implémentation SQL**. Utile pour expliquer le métier à un non-technique.

Outils suggérés : [**looping**](https://www.looping-mcd.fr/) (gratuit, dédié Merise), [draw.io](https://draw.io), ou [PlantUML](https://plantuml.com/fr/ie-diagram).

### MLD — Modèle Logique de Données

- **Statut** : pas fait
- **Complexité** : ⭐⭐
- **Fichiers** : `docs/database/assets/02-mld.png` + source

Transformation du MCD en tables relationnelles, avec clés primaires, clés étrangères, tables de jointure pour les many-to-many (`item_tags`). C'est le pont entre le MCD et le schéma SQL réel.

### Dictionnaire de données

- **Statut** : pas fait
- **Complexité** : ⭐⭐
- **Fichiers** : `docs/database/05-data-dictionary.md`

Tableau exhaustif de toutes les colonnes : nom, type SQL, contrainte (NOT NULL / UNIQUE / FK / DEFAULT), description métier. Une ligne par colonne. Référence pour les développeurs ET pour les audits RGPD (savoir où sont les données personnelles).

Format type :

| Table | Colonne | Type   | Contraintes                   | Description                               |
| :---- | :------ | :----- | :---------------------------- | :---------------------------------------- |
| users | id_user | UUID   | PK, DEFAULT gen_random_uuid() | Identifiant unique utilisateur            |
| users | email   | CITEXT | UNIQUE, NOT NULL              | Email de connexion, insensible à la casse |
| ...   | ...     | ...    | ...                           | ...                                       |

### Diagramme UML de classes (PlantUML)

- **Statut** : pas fait
- **Complexité** : ⭐⭐⭐
- **Fichiers** : `docs/architecture/uml/01-classes.puml`

Représentation des **entités, services, repositories** avec leurs relations. Doit montrer :

- **Héritage** (BaseEntity ← User / Item / Tag / Share)
- **Implémentation d'interfaces** (PgItemRepository implements IItemRepository)
- **Aggregation / composition** entre les services et leurs dépendances (ItemService o-- IItemRepository)
- **Multiplicités** (User "1" -- "0..\*" Item)

PlantUML supporte tout ça nativement. Voir la [doc PlantUML sur les diagrammes de classes](https://plantuml.com/fr/class-diagram).

### Diagramme UML de séquence (PlantUML)

- **Statut** : pas fait
- **Complexité** : ⭐⭐
- **Fichiers** : `docs/architecture/uml/02-sequence-*.puml`

Au moins **deux séquences** à diagrammer :

1. **Login** : Client → Controller → AuthService → UserRepository → TokenManager → réponse
2. **Création d'un item avec tags** : Client → Controller → ItemService → ItemRepository + ItemTagRepository → réponse

Voir la [doc PlantUML sur les diagrammes de séquence](https://plantuml.com/fr/sequence-diagram).

### Diagramme UML de cas d'utilisation (PlantUML)

- **Statut** : pas fait
- **Complexité** : ⭐⭐
- **Fichiers** : `docs/architecture/uml/03-use-cases.puml`

Cartographie des acteurs (Visiteur, Utilisateur, Admin) et de leurs cas d'usage (s'inscrire, se connecter, créer une pépite, partager, exporter ses données…). Avec les relations `<<include>>` et `<<extend>>` quand pertinent.

Voir la [doc PlantUML sur les use cases](https://plantuml.com/fr/use-case-diagram).

> 💡 Tous les diagrammes PlantUML peuvent être stockés en `.puml` (versionné) et générés en PNG/SVG via VS Code (extension PlantUML) ou un workflow CI dédié.

---

## 📋 Project management

### Setup GitHub Projects + backlog

- **Statut** : pas fait
- **Complexité** : ⭐
- **Fichiers** : aucun fichier — config sur GitHub

Après que les étudiants forkent / clonent le repo, créer un **GitHub Project** (vue Board ou Table) avec les colonnes classiques :

- `Backlog` — toutes les tâches de ce TODO transformées en issues
- `To Do` — sprint courant
- `In Progress` — en cours d'implémentation
- `Review` — PR ouverte, en attente de relecture
- `Done` — mergé

Créer une **issue par tâche** de ce TODO (template suggéré : titre, contexte, fichiers concernés, critères d'acceptation, complexité). Associer des **labels** (`feature`, `bug`, `docs`, `refactor`, `chore`) et des **milestones** (`v0.2 — production-ready`, `v0.3 — admin module`).

C'est l'occasion de pratiquer le workflow d'équipe : issues → branche → PR → review → merge → fermeture auto.

---

## 🔄 Migration et complétion du backend

### Migrer les fichiers `.js` restants vers `.ts`

- **Statut** : partiellement fait, quelques `.js` traînent encore dans `src/`
- **Complexité** : ⭐⭐
- **Fichiers** : à identifier avec `find src -name "*.js"`

L'ancienne archi Express SSR laissait des fichiers JavaScript que la migration n'a pas tous portés. **Cela ne concerne que les fichiers sous `src/`** — les scripts d'automatisation dans `scripts/` peuvent rester en JS. Pour chacun :

1. Renommer `.js` → `.ts`.
2. Ajouter le typage (`import { Request, Response } from 'express'`, etc.).
3. Convertir les `module.exports` / `require` en `export` / `import` ESM.
4. Faire passer ESLint + le type-check.
5. Adapter au pattern du codebase (classes avec DI plutôt que functions standalone).

### Nettoyer la config de test

- **Statut** : héritage de l'ancienne archi
- **Complexité** : ⭐
- **Fichiers** : `tests/unit/`, `tests/bootstrap.js`

À faire :

1. **Supprimer `tests/unit/`** — on utilise la colocation dans `src/**/__tests__/`, plus besoin du dossier central. (Vérifier d'abord qu'il n'y a aucun test utile dedans qui n'a pas été migré.)

2. **Supprimer `tests/bootstrap.js`** — pas utilisé. Nos tests actuels sont **purement unitaires avec mocks** (services avec repos mockés via `vi.fn()`, DTO/Zod, utilitaires purs). Aucun ne charge `.env.test` ni ne touche à `process.env`. Le fichier est un reliquat de l'ancienne archi Express SSR.

3. Une fois ces deux suppressions faites, le dossier `tests/` devient vide → le supprimer aussi.

> 💡 **Le jour où on ajoute des tests d'intégration** (contre une vraie DB de test, par exemple), il faudra recréer un setup. À ce moment-là, on créera `vitest.setup.ts` à la racine et on le référencera dans `vitest.config.js` via `test.setupFiles: ['./vitest.setup.ts']`. Pas avant — autant garder le projet propre.

### Phase 8 — AppEvents (audit logging)

- **Statut** : la table `app_events` existe, le service à créer
- **Complexité** : ⭐⭐⭐
- **Fichiers** : tout à créer (entity, repository, service, intégration)

La table SQL `app_events` est prête (voir migrations). Reste à :

1. Créer l'entité `AppEvent` + son interface `IAppEvent`.
2. Créer `IAppEventRepository` + `PgAppEventRepository`.
3. Créer `AppEventService` exposant `log(category, type, severity, message, metadata?)`.
4. **Injecter** `AppEventService` dans les services qui doivent logger : `AuthService` (login, logout, password change), `UserService` (account deletion), `ShareService` (token creation), etc.
5. Ne **pas** créer d'endpoint REST pour ça — c'est interne. (Sauf si on veut un endpoint admin lecture seule plus tard.)

Suivre le pattern existant : interface dans `src/interfaces/services/`, implémentation dans `src/services/`, câblage dans la composition root.

### Phase 9 — Routes Admin

- **Statut** : pas commencé
- **Complexité** : ⭐⭐⭐⭐
- **Fichiers** : nombreux fichiers à créer

L'enum `role_enum` existe avec `'customer'` et `'admin'`. À implémenter :

1. **Middleware `requireAdmin`** : vérifie que `req.user.role === 'admin'`, sinon 403.
2. **Routes admin** sous `/v1/admin/*` :
   - `GET /v1/admin/users` — liste tous les users
   - `PATCH /v1/admin/users/:id/role` — change le rôle
   - `DELETE /v1/admin/users/:id` — supprime un utilisateur (avec CASCADE sur ses données)
   - `GET /v1/admin/stats` — stats globales (nb users, items, tags…)
   - `GET /v1/admin/events` — lit la table `app_events` (paginé, filtres)
3. **Toutes ces routes loggent dans `app_events`** (action admin = traçable).

Documenter au passage les permissions dans Swagger (`security: [bearerAuth]` + tag `Admin`).

---

## 🐛 Dette technique

### `DatabaseErrorFactory` : mapper PG `22P02` → 400

- **Statut** : aujourd'hui ça renvoie 500
- **Complexité** : ⭐
- **Fichiers** : `src/exceptions/DatabaseErrorFactory.ts`

Le code PostgreSQL `22P02` signale un **input syntaxiquement invalide** pour un type (typiquement un UUID malformé). Aujourd'hui, si un client envoie `GET /v1/items/not-a-uuid`, le repo lance une `pg.DatabaseError`, le middleware la traite comme une erreur inconnue et renvoie 500.

À faire dans `DatabaseErrorFactory.queryFailed()` :

```ts
if (error.code === '22P02') {
  return new ApiError(400, 'INVALID_INPUT_SYNTAX', 'Invalid input format');
}
```

Idéalement, l'erreur est interceptée plus tôt par la validation Zod au controller (voir `validation-zod.md`). Mais le filet de sécurité reste utile.

### N+1 sur le listing des items

- **Statut** : connu, non corrigé
- **Complexité** : ⭐⭐⭐
- **Fichiers** : `src/repositories/PgItemRepository.ts`, `src/services/ItemService.ts`

Aujourd'hui, `GET /v1/items` charge les items, puis charge les tags item par item → **N+1 queries**. Pour 50 items avec tags, c'est 51 allers-retours SQL.

Solution : remplacer par **une seule query** avec `LEFT JOIN` + `JSON_AGG(JSON_BUILD_OBJECT(...))` qui retourne directement chaque item avec son tableau de tags. Voir [`docs/database/04-aggregation-and-views.md`](./docs/database/04-aggregation-and-views.md) pour le pattern.

Bonus : exposer cette query via une **vue** `v_items_with_tags` pour réutilisation et lisibilité.

### `tsconfig.build.json` : exclure les fichiers de test

- **Statut** : pas configuré
- **Complexité** : ⭐
- **Fichiers** : `tsconfig.build.json`

Aujourd'hui `pnpm build` compile aussi les `*.test.ts` dans `dist/`. Inutile (et risque de fuites de mocks en prod). Ajouter :

```jsonc
{
  "extends": "./tsconfig.json",
  "exclude": ["src/**/*.test.ts", "src/**/__tests__/**", "node_modules", "dist"]
}
```

Et utiliser ce fichier dans le script `build` : `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`.

---

## 💡 Ressources pour étudiants

### Rétro-engineering de la base de données

- **Statut** : exercice à proposer
- **Complexité** : ⭐⭐
- **Fichiers** : aucun (exercice de lecture)

Les étudiants ont **déjà accès à la base de données** déployée. Bel exercice :

1. Se connecter en `psql` ou DBeaver à la DB.
2. Reverse-engineer le schéma (`\d` dans psql, ou lecture des migrations dans `database/migrations/tables/`).
3. Produire à partir de ça :
   - Le **MCD** (manuellement, en oubliant temporairement les contraintes SQL)
   - Le **MLD** (en gardant les FK, types, contraintes)
   - Le **dictionnaire de données**
4. Comparer avec ce qui sera produit dans les tâches "Documentation" plus haut.

C'est un excellent moyen de **lier la théorie Merise au schéma réel**.

### Compléter la doc avec un guide PlantUML

- **Statut** : pas fait
- **Complexité** : ⭐⭐
- **Fichiers** : `docs/architecture/uml/README.md`

Une fois les premiers diagrammes UML produits, écrire un petit guide pour expliquer :

- Comment installer l'extension VS Code PlantUML
- Comment générer une image à partir d'un `.puml`
- Les conventions adoptées sur le projet (couleurs, regroupements, layout)
- Comment maintenir les diagrammes à jour quand le code change

---

## 🤝 Pour contribuer

Workflow attendu :

1. Choisir une tâche dans ce fichier (et créer l'issue GitHub correspondante si elle n'existe pas)
2. Créer une branche `feat/<nom-tâche-kebab-case>` (ou `fix/`, `docs/`, `refactor/` selon le type)
3. Coder, tester (un test minimum par tâche qui touche au code métier)
4. Commits conventionnels (voir `ONBOARDING.md`)
5. Pousser, ouvrir une PR vers `develop`
6. Demander une review, merger

Si tu repères un nouveau besoin ou un nouveau bug, ajoute-le directement à ce fichier dans la PR. C'est un document vivant.

---

_Dernière mise à jour : 12/05/2026_
