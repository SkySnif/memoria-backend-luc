# 🌿 Git Workflow

> Branch naming, commit messages, and the hooks that enforce them.

## Branching model

Simplified GitFlow:

```text
main         ← production-ready, protected, never push directly
  │
  ├── develop  ← integration branch, protected, merged from feature/*
  │     │
  │     ├── feature/auth-module
  │     ├── feature/items-crud
  │     ├── fix/login-redirect
  │     └── chore/upgrade-vite
```

## Branch naming

All branches except `main`, `develop`, `master` must follow `<type>/<description>`.

| Type        | When to use                         | Example                         |
| :---------- | :---------------------------------- | :------------------------------ |
| `feature/`  | New feature                         | `feature/items-tagging`         |
| `fix/`      | Bug fix                             | `fix/login-redirect-loop`       |
| `hotfix/`   | Critical production fix (from main) | `hotfix/security-cve`           |
| `docs/`     | Documentation only                  | `docs/architecture-diagram`     |
| `style/`    | Formatting / whitespace             | `style/prettier-pass`           |
| `refactor/` | Refactor without behavior change    | `refactor/extract-auth-service` |
| `perf/`     | Performance improvement             | `perf/lazy-load-routes`         |
| `test/`     | Tests only                          | `test/auth-store-coverage`      |
| `build/`    | Build system / dependencies         | `build/upgrade-vite-7`          |
| `ci/`       | CI/CD                               | `ci/add-coverage-report`        |
| `chore/`    | Maintenance                         | `chore/cleanup-old-mocks`       |
| `release/`  | Release preparation                 | `release/0.2.0`                 |

Rules: lowercase, hyphens only, no leading/trailing hyphen, no underscores, no camelCase. Enforced by `post-checkout` and `pre-push` hooks.

## Commit message format

Conventional Commits with stricter rules (see `commitlint.config.js`).

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Enforced rules

| Rule         | Value                                                                                                  |
| :----------- | :----------------------------------------------------------------------------------------------------- |
| type         | `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`, `hotfix` |
| scope        | **Mandatory**, lowercase, 2–25 chars                                                                   |
| subject      | Lowercase start, no trailing period, **≥ 10 characters**                                               |
| header total | ≤ 100 characters                                                                                       |

### Common scopes

- **Code areas**: `schemas`, `services`, `stores`, `composables`, `views`, `router`, `mocks`, `utils`
- **Tooling**: `deps`, `env`, `eslint`, `prettier`, `commitlint`, `husky`, `hooks`, `lint-staged`
- **Project-wide**: `init`, `app`, `docs`, `readme`

### Valid examples

```text
feat(schemas): add user zod schemas with role enum
fix(router): redirect to login when session expires
chore(deps): bump vite to 6.1
docs(readme): update install instructions
test(api): add edge cases for 401 handling
```

### Common pitfalls

| ❌ Bad                   | Why                  | ✅ Fixed                     |
| :----------------------- | :------------------- | :--------------------------- |
| `add login`              | No type, no scope    | `feat(auth): add login flow` |
| `feat: add login flow`   | No scope             | `feat(auth): add login flow` |
| `feat(auth): Add login`  | Capital "A"          | `feat(auth): add login`      |
| `feat(auth): add login.` | Trailing period      | `feat(auth): add login flow` |
| `feat(auth): add login`  | Subject only 9 chars | `feat(auth): add login flow` |

### Fixing a bad commit message

```bash
git commit --amend                    # last commit
git rebase -i HEAD~3                  # older commits (mark "reword")
```

## Hooks (Husky)

Four hooks enforce these conventions automatically. They activate on `pnpm install` via the `prepare` script.

| Hook            | When                | What it does                                             |
| :-------------- | :------------------ | :------------------------------------------------------- |
| `post-checkout` | After branch switch | Validates the branch name                                |
| `pre-commit`    | Before commit       | Runs `lint-staged` (eslint + prettier on staged files)   |
| `commit-msg`    | Validating message  | Runs commitlint, rejects invalid messages                |
| `pre-push`      | Before push         | Blocks push to `main`/`develop`, runs type-check + tests |

### Bypassing a hook

```bash
git commit --no-verify -m "..."   # skips pre-commit + commit-msg
git push --no-verify              # skips pre-push
```

**OK** for throwaway WIP commits on a private branch you'll squash. **Not OK** for anything you intend to merge — bypassing defeats the purpose.

## Full workflow walkthrough

### Starting a feature

```bash
git checkout develop && git pull
git checkout -b feature/my-thing develop
```

### Making changes

```bash
git add <files>
git commit -m "feat(scope): meaningful description here"
# pre-commit → formats staged files
# commit-msg → validates the message
```

### Pushing

```bash
git push -u origin feature/my-thing
# pre-push → type-check + tests must pass
```

### Merging back

Via PR/MR on the remote (GitHub, GitLab, …). Never merge locally without review.

```bash
git checkout develop && git pull
git branch -d feature/my-thing
```

### Releasing (develop → main)

```bash
git checkout -b release/0.2.0 develop
# Bump version, finalize CHANGELOG
git commit -m "release(version): bump to 0.2.0"
# PR release/0.2.0 → main, then tag main:
git tag -a v0.2.0 -m "Release 0.2.0" && git push origin v0.2.0
# Merge main back into develop
git checkout develop && git merge --no-ff main
```

## Related docs

- [`01-typescript-style.md`](./01-typescript-style.md) — code style conventions
- [`02-file-organization.md`](./02-file-organization.md) — file layout
- [`../frontend/01-getting-started.md`](../frontend/01-getting-started.md) — install and run

[⬆ Back to docs index](../README.md)

---

_Dernière mise à jour : 12/05/2026_
