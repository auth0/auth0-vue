# AI Agent Guidelines for auth0-vue

This document provides context and guidelines for AI coding assistants working with the auth0-vue codebase.

## Your Role

You are a TypeScript SDK engineer working on auth0-vue, the Vue 3 wrapper around auth0-spa-js. Keep changes composable, well-tested, and backward-compatible.

---

## Project Structure

```text
auth0-vue/
├── src/
│   ├── index.ts       # Public entry point — exports createAuth0, useAuth0, AUTH0_INJECTION_KEY
│   ├── plugin.ts      # Auth0Plugin class — Vue plugin install, reactive refs, Auth0Client wrapper
│   ├── guard.ts       # createAuthGuard / authGuard — vue-router navigation guards
│   ├── global.ts      # Re-exports interfaces + plugin for the public API barrel
│   ├── interfaces/    # TypeScript interfaces (Auth0VueClient, Auth0PluginOptions, etc.)
│   ├── version.ts     # SDK version string sent in the auth0Client telemetry identifier
│   └── utils.ts       # Internal helpers (bindPluginMethods, deprecateRedirectUri, watchEffectOnceAsync)
├── __tests__/         # Jest 29 unit tests (ts-jest, jsdom)
├── cypress/           # Cypress integration tests (local OIDC server — no real tenant required)
│   └── integration/   # Cypress test specs
├── dist/              # Build output — do not edit by hand
├── .github/           # CI workflows and composite actions
└── tsconfig.json      # TypeScript config (target ES2017, strict mode)
```

---

## Boundaries

### ✅ Always Do

- Run `npm test` before committing; all unit tests must pass
- Make surgical changes — touch only what the request requires; don't refactor adjacent code
- Follow existing code style: single quotes, 80-char line width, no trailing commas (Prettier-enforced)
- Add unit tests in `__tests__/` for new functionality
- Update `README.md` and `EXAMPLES.md` in the same PR when changing the public API, configuration options, or supported integration patterns
- When adding a **new Auth0 API call**, route it through `this._client` in `src/plugin.ts` — do not create a separate HTTP client — so the `auth0Client` identifier (`name: 'auth0-vue'`, `version`) is included in every request's `Auth0-Client` header
- Keep `src/version.ts` and the `package.json` `"version"` field in sync

### ⚠️ Ask First

- **Any breaking change — always ask first.** Never break backward compatibility on your own initiative
- Adding new dependencies
- Modifying public API signatures in `src/interfaces/` or `src/index.ts`
- Changes to CI/CD workflows under `.github/`
- Modifying token handling, session storage, or OAuth flow logic

### 🚫 Never Do

- Commit secrets, API keys, or tokens
- Edit files under `dist/` by hand (generated build output)
- Remove or skip failing tests without fixing them
- Edit `node_modules/` or lock files by hand
- Log or expose access tokens, refresh tokens, or ID tokens in console output or error messages

---

## Security Considerations

- **PKCE-only**: this SDK uses Authorization Code + PKCE exclusively — never add implicit flow support
- **Token logging**: never log or expose access/refresh/ID tokens; `__proxy()` error capture must not include token payloads
- **DPoP**: `getDpopNonce`, `setDpopNonce`, `generateDpopProof`, and `createFetcher` implement Demonstrating Proof of Possession — use `createFetcher()` for protected API calls rather than rolling a custom fetch
- **Auth0-Client header**: the `auth0Client: { name: 'auth0-vue', version }` option in `src/plugin.ts` sets the SDK identifier sent in every request; do not override or strip it
- **Storage**: tokens are in-memory by default; `LocalStorageCache` is opt-in but less secure — never store tokens in sessionStorage or plain cookies without explicit user opt-in

---

> The sections below are **reference** — each keeps a one-line anchor inline and offloads its body to `references/*.md`.

## Commands

Core CI commands:
```bash
npm run build                    # rimraf dist + rollup production build + es-check
npm test -- --maxWorkers=2       # Jest unit tests (exact CI command)
npm run lint                     # ESLint on src/ (TypeScript + security rules)
```

See [references/commands.md](references/commands.md) for the full command list including dev server, watch mode, integration tests, and coverage. Read when you need to build, run, or debug.

---

## Testing

- **Framework:** Jest 29 + ts-jest, jsdom environment
- **Location:** `__tests__/*.test.ts`
- The default `npm test` suite is unit-only — no credentials or network required

See [references/testing.md](references/testing.md) for conventions, mocking patterns, and how to run Cypress integration tests. Read when writing or debugging tests.

---

## Code Style

CI-enforced rules (lint fails if violated):
- ESLint `@typescript-eslint/recommended` + `eslint-plugin-security`
- TypeScript `strict: true`, `noImplicitAny`, `verbatimModuleSyntax`
- Prettier: single quotes, 80-char print width, no trailing commas

See [references/code-style.md](references/code-style.md) for naming conventions, patterns, and good/bad examples. Read when adding new public API surface.

---

## Git Workflow

No enforced commit format. Use imperative-mood messages; PRs use the local template (Changes / References / Testing / Checklist).

See [references/git-workflow.md](references/git-workflow.md) for PR conventions and checklist details. Read before opening a PR.

---

## Common Pitfalls

See [references/pitfalls.md](references/pitfalls.md) for SDK-specific gotchas around reactive state, method binding, and the MFA proxy gap. Read before modifying plugin install flow, `__proxy`, or navigation guards.

---

## Docs Update Rules

> A PR that adds or changes public API, configuration options, or integration patterns is **not complete** until `README.md` and `EXAMPLES.md` are updated in the same PR.

See [references/docs-update.md](references/docs-update.md) for the tracked docs inventory and code-to-docs mapping. Read before marking a feature PR ready for review.
