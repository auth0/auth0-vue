# Docs Update Reference

## Tracked Docs

| Doc | Covers | Status |
|-----|--------|--------|
| `README.md` | Installation, requirements, SDK configuration, login/logout quick-start, API reference links | Present |
| `EXAMPLES.md` | Full code samples: login, logout, user profile, calling API, ID token claims, error handling, route guards, organizations, DPoP, Online Access, MFA, step-up auth, custom token exchange, passkeys, MyAccount API | Present |

Migration guides are not tracked here — their filename is version-specific and is inferred from the release branch at the time of a breaking change.

## When You Change Code, Update These Docs

This is a **library / SDK** — the public API surface is the exported symbols from `src/index.ts` and `src/global.ts`.

| When this changes | Update these docs |
|-------------------|-------------------|
| Public API surface (`createAuth0`, `useAuth0`, `createAuthGuard`, `authGuard`, exported types) | `README.md` (API reference section), `EXAMPLES.md` (all affected samples) |
| Configuration options (`Auth0VueClientOptions`, `Auth0PluginOptions`) | `README.md` (Configure the SDK section) |
| Authentication flow supported (new login method, new grant type) | `README.md` (quick-start), `EXAMPLES.md` (add a usage example) |
| Installation / package name / peer dependency requirements | `README.md` (Installation section) |
| Any new public method added to `Auth0VueClient` | `EXAMPLES.md` (add a usage sample for the new method) |
| Any public method removed or renamed | `README.md` (remove/update references), `EXAMPLES.md` (remove/update affected samples) |
| New integration pattern (DPoP, MFA, passkeys, MyAccount, custom token exchange) | `EXAMPLES.md` (add integration example) |

> When you touch code that maps to a doc above, update that doc **in the same PR** — do not defer.
