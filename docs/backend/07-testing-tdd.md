# 🧪 Testing & TDD

> Red. Green. Refactor. Run tests in watch mode while you code.

## The TDD loop

```text
        ┌────────────┐
        │   RED      │  Write a failing test.
        │            │  Run it. Confirm it fails for the right reason.
        └─────┬──────┘
              │
              ▼
        ┌────────────┐
        │   GREEN    │  Write the minimum code to make it pass.
        │            │  Resist "while I'm here…".
        └─────┬──────┘
              │
              ▼
        ┌────────────┐
        │  REFACTOR  │  Improve the design, keep tests green.
        │            │  Tests are your safety net.
        └─────┬──────┘
              │
              └──→ Next test.
```

Run tests in watch mode while coding: `pnpm test:watch`.

## Where tests live — colocation

Tests live in `__tests__/` folders **next to the code they test**:

```text
src/services/
├─ TagService.ts
└─ __tests__/
   └─ TagService.test.ts

src/utils/
├─ SlugGenerator.ts
└─ __tests__/
   └─ SlugGenerator.test.ts

src/dto/tag/
├─ CreateTagDto.ts
└─ __tests__/
   └─ CreateTagDto.test.ts
```

Why colocation:

- **Discoverability**: open `TagService.ts`, the test is right next door.
- **Refactor-friendliness**: rename the file, the test file moves with it.
- **Less folder hopping**: writing the test is part of writing the code.

> Note: we use `__tests__` (singular). The convention varies (`__tests__` is also common); pick one and stay consistent.

## What we test, where

| Layer      | Test type  | Pattern                                                              |
| :--------- | :--------- | :------------------------------------------------------------------- |
| Service    | Unit       | Mock the repositories via `vi.fn()`, test business rules.            |
| Repository | _(rarely)_ | Skipped unless the SQL is complex. Integration tests cover it later. |
| Controller | _(rarely)_ | Thin glue; integration tests cover them.                             |
| DTO + Zod  | Unit       | Test valid inputs, invalid inputs, edge cases.                       |
| Utility    | Unit       | Pure function tests. Easy and high ROI.                              |

**Where to spend effort, in priority order**: services > DTOs > utilities. Repositories and controllers get integration coverage when we add it.

## Pattern: service test with mock repos

The canonical example:

```ts
// src/services/__tests__/TagService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagService } from '../TagService';
import type { ITagRepository } from '@/interfaces/repositories/ITagRepository';

describe('TagService', () => {
  let tagRepo: ITagRepository;
  let service: TagService;

  beforeEach(() => {
    tagRepo = {
      findAllByUser: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    service = new TagService(tagRepo);
  });

  describe('create()', () => {
    it('creates a tag with a normalized name', async () => {
      vi.mocked(tagRepo.findByName).mockResolvedValueOnce(null);
      vi.mocked(tagRepo.create).mockResolvedValueOnce(/* fake tag entity */);

      const tag = await service.create('user-1', { tagName: '  Philosophie  ' });

      expect(tag.tagName).toBe('philosophie');
      expect(tagRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        tagName: 'philosophie'
      });
    });

    it('throws TagErrorFactory.duplicateName when a tag with that name already exists', async () => {
      vi.mocked(tagRepo.findByName).mockResolvedValueOnce(/* existing tag */);

      await expect(service.create('user-1', { tagName: 'philo' })).rejects.toThrow(
        'TAG_DUPLICATE_NAME'
      );
    });
  });
});
```

Key moves:

- **Mock the interface**, not the concrete `PgTagRepository`. The service depends on `ITagRepository`.
- Use `vi.mocked(fn)` to get type-safe access to `.mockResolvedValueOnce()`.
- Assert **behavior** (return value, side-effects on the mock), not implementation details.
- Test the happy path **and** the error path for every business rule.

## Pattern: DTO + Zod schema test

```ts
// src/dto/tag/__tests__/CreateTagDto.test.ts
import { describe, it, expect } from 'vitest';
import { CreateTagSchema } from '@/constants/zod/tag/createTag';

describe('CreateTagSchema', () => {
  it('accepts a valid tag name', () => {
    const result = CreateTagSchema.safeParse({ tagName: 'philosophie' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty tag name', () => {
    const result = CreateTagSchema.safeParse({ tagName: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['tagName']);
  });

  it('rejects names longer than 50 characters', () => {
    const result = CreateTagSchema.safeParse({ tagName: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });
});
```

`safeParse` is preferred in tests — it returns a discriminated union you can assert against without `try/catch`.

## Pattern: utility test

```ts
// src/utils/__tests__/SlugGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { SlugGenerator } from '../SlugGenerator';

describe('SlugGenerator', () => {
  it('lowercases the input', () => {
    expect(SlugGenerator.generate('Hello World')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(SlugGenerator.generate('Éloge de la folie')).toBe('eloge-de-la-folie');
  });

  it('returns an empty string for empty input', () => {
    expect(SlugGenerator.generate('')).toBe('');
  });
});
```

Pure functions are the cheapest, most valuable tests. Don't skip them.

## Vitest config

`vitest.config.js` is short:

```js
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // describe/it/expect are global
    environment: 'node',
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
    exclude: ['node_modules', 'dist']
  }
});
```

> The config stays in `.js` (it's a root config file, no need for TypeScript). No `setupFiles` here because our current tests are **pure unit tests with mocks** — no real DB, no env vars to bootstrap. If we add integration tests later, we'll introduce a `vitest.setup.ts` at that point.

Path aliases (`@/...`) come from `tsconfig.json` via `vite-tsconfig-paths`. Don't forget to add `"vitest/globals"` to `tsconfig.json`'s `types` array so TypeScript knows about `describe`, `it`, `expect`, `vi` without explicit imports.

## Running tests

```bash
pnpm test            # single run (used by pre-push hook)
pnpm test:watch      # watch mode for TDD
pnpm test:coverage   # HTML report in coverage/index.html
```

The `pre-push` hook runs `pnpm test` — if any test fails, the push is blocked.

## Coverage

We don't enforce a coverage threshold. **Coverage is a smell detector, not a goal.** Aim for testing what matters — services, edge cases, error paths — not for a number.

## What NOT to test

- ❌ The framework (Express routing, `pg` query execution).
- ❌ Generated types (TypeScript already enforces them).
- ❌ Trivial passthrough (a controller method that just does `res.json(await service.list())` is integration territory).
- ❌ Private state (mock-and-assert-internal-property is a code smell).

## What's worth testing every time

- ✅ Service methods: success path, error paths, edge cases.
- ✅ Zod schemas: every constraint (min, max, format, refinements).
- ✅ Utilities: every branch of pure logic.
- ✅ Error factories: assert the resulting `ApiError` has the right status and code.

## Naming

```ts
describe('subject under test', () => {
  it('verb-first description of expected behavior', () => {
    /* ... */
  });
});
```

Examples:

- ✅ `it('returns null when no item matches')`
- ✅ `it('throws ItemErrorFactory.notFound when the id is unknown')`
- ❌ `it('test 1')` / `it('should work')`

## Related docs

- [`03-database-connection.md`](./03-database-connection.md) — `MockItemRepository` as a test double for `PgItemRepository`.
- [`04-error-handling.md`](./04-error-handling.md) — asserting thrown `ApiError` subclasses.
- [`../conventions/01-typescript-style.md`](../conventions/01-typescript-style.md) — TSDoc applies to test files too.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
