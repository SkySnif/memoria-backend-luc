# 📐 TypeScript Style — TSDoc, Visibility, Naming

> The rulebook for writing code in this project. Read it once, internalize it, then follow it without ceremony.

## Philosophy

We aim for **Java-level explicitness about contracts** combined with **TypeScript-level concision**. That means:

- Every exported symbol has TSDoc.
- Visibility is communicated via the module boundary (`export` vs. not), reinforced by `@public` / `@internal` tags.
- We use classes only when the construct has real **identity** (an instance with state and behavior — like an error type). Services, utilities and helpers are plain functions or objects.
- We never sacrifice clarity for cleverness.

## Visibility: how we do it in this codebase

TypeScript offers several visibility mechanisms. We use them with intent.

### 1. Module-level: `export` vs. no `export` (primary tool)

ES modules give us encapsulation for free. A symbol that isn't exported is **invisible outside the file** — stricter than Java's package-private.

```ts
// helpers.ts

// Not exported → unreachable from outside. This is our "private".
function buildUrl(base: string, path: string): string {
  return `${base}${path}`;
}

// Exported → public API. Document with TSDoc.
/**
 * Fetches a user by id.
 * @public
 */
export function fetchUser(id: string) {
  const url = buildUrl(BASE_URL, `/users/${id}`);
  // ...
}
```

**Rule**: don't export "just in case". Exporting is a commitment to a public contract.

### 2. TSDoc tags: `@public`, `@internal`, `@deprecated`

When the export/no-export rule isn't enough (e.g. a symbol is exported only so tests can reach it), tag it explicitly:

```ts
/**
 * Internal helper used by `api`. Exported only for direct testing.
 * Application code must not import this — use `api.*` instead.
 *
 * @internal
 */
export function buildHeaders(extra?: Record<string, string>) {
  /* ... */
}
```

The tag is enforceable later (via `eslint-plugin-tsdoc` or `api-extractor`) and immediately readable to humans.

### 3. Class members: `public`, `private`, `protected`, `#field`

We use **classes only when an instance has identity** — typically for **error types** (`ApiError`) and **domain entities with invariants**. For services, HTTP clients, repositories, etc., we prefer objects and functions (see [`../architecture.md`](../architecture.md) for the rationale).

When you do write a class, annotate visibility explicitly:

```ts
export class ApiError extends Error {
  public constructor(
    public readonly status: number, // ← public, readonly: contract is clear
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

For genuinely runtime-private state (rare), use ES private fields with `#`:

```ts
class Counter {
  #count = 0; // truly private — invisible to JS at runtime

  public increment(): void {
    this.#count++;
  }
}
```

**When to use which class modifier**:

- `public` — explicit on every class member you want callable from outside.
- `private` — for internal members where TS-only enforcement is fine.
- `#field` — when the type might leak to consumers via libraries, for security-sensitive state, or to absolutely prevent monkey-patching.

### 4. `readonly` — communicates intent

Mark fields and parameters `readonly` whenever they aren't reassigned after construction. Documentation as much as enforcement:

```ts
public readonly status: number   // caller knows: never mutated
```

## TSDoc: the contract layer

Every **exported** symbol carries TSDoc. Internal helpers may skip it if the name and signature are self-evident.

### Required tags

| Tag              | When to use                                                          |
| :--------------- | :------------------------------------------------------------------- |
| Summary          | One-line description, first line of the comment.                     |
| `@param`         | Every parameter that isn't trivially named.                          |
| `@returns`       | Every non-void return.                                               |
| `@throws`        | Every error type the caller should expect.                           |
| `@example`       | Recommended for non-trivial public API.                              |
| `@typeParam`     | For each generic parameter that needs explanation.                   |
| `@public`        | Marks the public API (paired with `@internal` for boundary clarity). |
| `@internal`      | Marks symbols _exported for testing only_, not for app code.         |
| `@remarks`       | For context, gotchas, or links to related docs.                      |
| `@see` / `@link` | Cross-references (`@link` inline, `@see` in a block).                |

### Template

````ts
/**
 * Performs a GET and validates the response against the provided schema.
 *
 * @typeParam T - Inferred from the schema. Return type is `z.infer<typeof schema>`.
 * @param path - API path, e.g. `/items` (prepended with the base URL).
 * @param schema - Zod schema used to parse and type the response body.
 * @param options - Optional headers and abort signal.
 * @returns The parsed, validated response body.
 * @throws {@link ApiError} on non-2xx responses.
 * @throws ZodError if the response does not match the schema.
 *
 * @example
 * ```ts
 * const user = await api.get('/users/me', userSchema)
 * ```
 *
 * @public
 */
async get<T>(path: string, schema: z.ZodType<T>, options?: ApiRequestOptions): Promise<T>
````

### TSDoc on composables and stores

For composables, document the _return shape_ — that's the public API:

```ts
/**
 * Reactive state and actions for managing the current user's items.
 *
 * @returns An object with:
 *  - `items`: reactive ref of `Item[]`
 *  - `loading`: reactive ref of `boolean`
 *  - `error`: reactive ref of `string | null`
 *  - `load()`: fetches the items from the backend
 *
 * @public
 */
export function useItems() {
  /* ... */
}
```

## Naming conventions

| Symbol           | Convention                            | Example                            |
| :--------------- | :------------------------------------ | :--------------------------------- |
| File: composable | `useXxx.ts`                           | `useAuth.ts`, `useItems.ts`        |
| File: service    | `xxxApi.ts`                           | `authApi.ts`, `itemsApi.ts`        |
| File: schema     | `xxx.ts` (entity name, singular)      | `item.ts`, `user.ts`               |
| File: store      | `useXxxStore.ts`                      | `useAuthStore.ts`                  |
| File: component  | `PascalCase.vue`                      | `ItemCard.vue`                     |
| File: view       | `XxxView.vue`                         | `HomeView.vue`, `ItemEditView.vue` |
| Type / Interface | `PascalCase`                          | `Item`, `ApiRequestOptions`        |
| Constant         | `UPPER_SNAKE_CASE` for true constants | `BASE_URL`                         |
| Variable         | `camelCase`                           | `currentUser`                      |
| Function         | `camelCase`, verb-first               | `fetchUser`, `buildPayload`        |
| Class            | `PascalCase`, noun                    | `ApiError`                         |
| Private member   | `camelCase` (no `_` prefix)           | `baseUrl`, `rawRequest`            |
| Hard private     | `#camelCase`                          | `#count`                           |
| Boolean          | `is`/`has`/`should` prefix            | `isLoading`, `hasError`            |

**Reject** Hungarian notation, underscore prefixes for "private", and abbreviations (`usr`, `btn`, `cfg`). Be explicit.

## Imports

Use the `@/` alias for `src/` paths. Group imports:

```ts
// 1. External
import { ref, computed, onMounted } from 'vue';
import { z } from 'zod';

// 2. Internal — services / schemas / stores
import { api, ApiError } from '@/services/api';
import { itemSchema } from '@/schemas/item';

// 3. Types only (use `import type`)
import type { Item } from '@/schemas/item';

// 4. Same-folder relative imports
import { formatDate } from './formatDate';
```

## File length

Soft cap: **300 lines**. If a file exceeds this, ask whether it has more than one responsibility. Split.

## Functions

- Soft cap on function length: **40 lines**. If you cross it, consider extracting.
- One verb per name (`fetchAndCacheUser` is two verbs → split).
- Prefer `async`/`await` over `.then()`/`.catch()` chains.

## Error handling

Three legitimate patterns, in order of preference:

1. **Throw an `ApiError` (or specific subclass) at the source**, let the caller handle.
2. **`.catch((e) => e)` to inspect** in tests or where you genuinely need both branches.
3. **`try/catch/finally`** for cleanup (e.g. `loading.value = false` in a `finally`).

Never swallow errors silently. Never `catch` without re-throwing or logging.

## When to use a class

Default: **don't**. Use functions and objects. Reach for a class only when one of these applies:

- ✅ The construct is an **error type** (`ApiError`, future `ValidationError`…). Errors are class-based by JS convention.
- ✅ The construct has a **distinct identity** with state that should be encapsulated as an instance (rare on the frontend; more common in backend DDD).
- ✅ You genuinely need **inheritance** for a closed hierarchy (rare).
- ✅ You need **runtime-private state** via `#fields`.

For HTTP clients, services, repositories, validators, utilities, composables, stores — **use functions/objects**. Doing so keeps the codebase consistent with composables (which must be functions) and stores (which are setup-style functions in Pinia).

## Related docs

- [`02-file-organization.md`](./02-file-organization.md) — where things go.
- [`../architecture.md`](../architecture.md) — the layers these conventions serve.

[⬆ Back to docs index](../README.md)

---

_Dernière mise à jour : 12/05/2026_
