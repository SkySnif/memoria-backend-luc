# 🔐 Authentication & JWT

> Stateless JWT with refresh rotation, Argon2id passwords, and a Bearer-only middleware.

## The big picture

```text
1. POST /v1/auth/register   → creates a user, returns access + refresh tokens
2. POST /v1/auth/login      → verifies password, returns access + refresh tokens
3. (every request)          → Authorization: Bearer <access_token>
                              AuthMiddleware verifies, sets req.user
4. POST /v1/auth/refresh    → exchanges refresh for new access + refresh (rotation)
5. POST /v1/auth/logout     → blacklists the refresh token
```

No server-side sessions. No cookies. Every protected request carries its own credential. This is what "stateless" means.

## Why two tokens

- **Access token** (15 min TTL) — sent with every request. Short-lived to limit damage if leaked.
- **Refresh token** (7 days TTL) — held by the client, used only to obtain a new access token. Rotated on every use.

If the access token is stolen, the attacker has 15 minutes. If the refresh token is stolen, the legitimate user's next refresh will invalidate the stolen one (because each refresh issues a new pair and blacklists the old one).

## Password hashing — Argon2id

We use **Argon2id** via `@node-rs/argon2` (the OWASP-recommended algorithm since 2024). Never plaintext, never MD5, never an unsalted SHA-256.

```ts
// src/utils/PasswordHasher.ts (simplified)
import { hash, verify, Algorithm } from '@node-rs/argon2';

export const PasswordHasher = {
  async hash(plain: string): Promise<string> {
    return hash(plain, { algorithm: Algorithm.Argon2id });
  },

  async verify(plain: string, stored: string): Promise<boolean> {
    return verify(stored, plain);
  }
};
```

⚠️ **Argument order matters**: `@node-rs/argon2`'s `verify(stored, plain)` is the opposite of what feels natural. We wrap it above so the call site reads `PasswordHasher.verify(plain, stored)` — much harder to invert.

What gets stored in the DB:

```text
password_hash | $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
```

The hash is self-describing: algorithm, parameters, salt, and hash are all in one string. No separate salt column.

## Token issuance — `TokenManager`

JWTs are signed and verified with [`jose`](https://github.com/panva/jose). The `TokenManager` wraps it:

```ts
// src/utils/TokenManager.ts (simplified)
export class TokenManager {
  constructor(
    private readonly accessSecret: Uint8Array,
    private readonly refreshSecret: Uint8Array
  ) {}

  async signAccess(payload: { sub: string; role: string }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.accessSecret);
  }

  async signRefresh(payload: { sub: string }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(this.refreshSecret);
  }

  async verifyAccess(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, this.accessSecret);
    return payload;
  }

  async verifyRefresh(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, this.refreshSecret);
    return payload;
  }
}
```

The two secrets come from `.env` (`JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET`) and **must be different**. Generate them with `pnpm gen:secrets`.

### Algorithm choice

- **HS256** is what we use — symmetric, one secret per token type. Simple.
- **RS256/ES256** would be needed if a separate service (a microservice, a CDN edge) had to verify tokens without the signing secret. Single-process API → HS256 is enough.

## Refresh token rotation

Every call to `POST /v1/auth/refresh` returns a **new** access + refresh pair, and the **old refresh token** is added to the blacklist. This guarantees:

- A leaked refresh token has at most one successful use before being invalidated.
- The user's next legitimate refresh fails (their stored token has been rotated by the attacker) → forced re-login → security event detected.

The blacklist is an **in-memory map** in `BlacklistService`, keyed on the JWT `jti` (JWT ID) claim:

```ts
// src/services/BlacklistService.ts (simplified)
export class BlacklistService implements IBlacklistService {
  private readonly blacklist = new Map<string, number>(); // jti → expiresAt

  add(jti: string, expiresAt: number): void {
    this.blacklist.set(jti, expiresAt);
    this.cleanupExpired();
  }

  isBlacklisted(jti: string): boolean {
    const exp = this.blacklist.get(jti);
    if (!exp) return false;
    if (exp < Date.now()) {
      this.blacklist.delete(jti);
      return false;
    }
    return true;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [jti, exp] of this.blacklist) {
      if (exp < now) this.blacklist.delete(jti);
    }
  }
}
```

**Limitations of an in-memory blacklist:**

- Lost on process restart → all sessions invalidated. Acceptable for a single-instance deployment.
- Does not scale across multiple workers without shared state.

When the API grows beyond a single process, swap the implementation for a Redis-backed store. The `IBlacklistService` interface stays the same; only the composition root changes. See [`08-deployment.md`](./08-deployment.md#scaling-beyond-one-instance).

## The middleware — `AuthMiddleware`

Protects routes by verifying the access token in the `Authorization` header:

```ts
// src/middlewares/AuthMiddleware.ts (simplified)
export class AuthMiddleware {
  constructor(
    private readonly tokenManager: TokenManager,
    private readonly blacklist: IBlacklistService
  ) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw TokenError.invalid('Missing Bearer token');
    }

    const token = header.slice('Bearer '.length);
    const payload = await this.tokenManager.verifyAccess(token); // throws if invalid/expired

    if (payload.jti && this.blacklist.isBlacklisted(payload.jti)) {
      throw TokenError.revoked();
    }

    req.user = { id: payload.sub as string, role: payload.role as string };
    next();
  };
}
```

`req.user` is typed via `src/types/express.d.ts`:

```ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}
```

Routers wrap `authenticate` around any protected endpoint:

```ts
router.get('/items', auth.authenticate, controller.list);
```

## Endpoint summary

| Endpoint                 | Auth | What it does                                            |
| :----------------------- | :--- | :------------------------------------------------------ |
| `POST /v1/auth/register` | ❌   | Create user, return access + refresh.                   |
| `POST /v1/auth/login`    | ❌   | Verify password, return access + refresh.               |
| `POST /v1/auth/refresh`  | ❌\* | Exchange refresh for new pair. Old refresh blacklisted. |
| `POST /v1/auth/logout`   | ✅   | Blacklist the current refresh token.                    |
| `GET /v1/auth/me`        | ✅   | Returns the current authenticated user.                 |

\* `/refresh` doesn't go through `AuthMiddleware`. The refresh token is sent in the request body and verified by `AuthService.refresh()` directly.

## Security checklist

- ✅ Use HTTPS in production. Plaintext JWTs over HTTP defeat the entire model.
- ✅ Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to cryptographically strong values (use `pnpm gen:secrets`).
- ✅ Never log token values — not even on errors. Log `jti` and `sub` if you need debugging context.
- ✅ Rotate secrets when you suspect compromise — all existing tokens become invalid (effectively logout-everyone).
- ✅ Run behind a rate limiter on `/login` and `/register` to prevent brute force.
- ❌ Never store tokens in `localStorage` on the client — vulnerable to XSS. Use `httpOnly` cookies or in-memory only.

## Related docs

- [`04-error-handling.md`](./04-error-handling.md) — `TokenError` and `PasswordError` factories.
- [`05-validation-zod.md`](./05-validation-zod.md) — schemas for register/login bodies.
- [`07-testing-tdd.md`](./07-testing-tdd.md) — mocking `TokenManager` in tests.
- [`08-deployment.md`](./08-deployment.md) — moving the blacklist to Redis in production.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
