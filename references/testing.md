# Testing Reference

## Framework

- **Unit tests:** Jest 29 + ts-jest, jsdom environment (`jest.config.cjs`)
- **Integration tests:** Cypress 15 (`cypress.config.cjs`)
- **Coverage:** Istanbul/lcov (via Jest `--coverage`), uploaded to Codecov in CI

## Unit Tests

Location: `__tests__/**/*.test.ts` — one file per source module.

Run safely (no credentials, no network):
```bash
npm test                                      # all tests + coverage
npm test -- --testPathPattern guard           # single test file by name pattern
npm run test:watch                            # watch mode for TDD
```

### Conventions

- Import `describe`, `expect`, `it`, `jest`, `beforeEach`, `afterEach` from `@jest/globals` explicitly (not global Jest API)
- Mock `@auth0/auth0-spa-js` at module level via `jest.mock(...)`
- Mock `vue` partially, preserving reactive helpers via `jest.requireActual('vue')`
- Test file naming: `<source-file>.test.ts` (e.g. `plugin.test.ts`, `guard.test.ts`)
- `tsconfig.test.json` relaxes `noImplicitAny` and sets `target: es6` for test files only

### Mocking Patterns

**Auth0Client** is mocked at the module level in all test files:

```typescript
jest.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: jest.fn().mockImplementation(() => ({
    checkSession: checkSessionMock,
    loginWithRedirect: loginWithRedirectMock,
    // add mocks for methods under test
  }))
}));
```

**Vue's `inject`** is mocked when testing composables (`useAuth0`):

```typescript
jest.mock('vue', () => ({
  ...(jest.requireActual('vue') as any),
  inject: jest.fn()
}));
```

**Vue Router** is mocked via a plain object with `push` as a jest mock:

```typescript
const mockRouter = { push: jest.fn() } as unknown as Router;
```

## Integration Tests (Cypress)

Location: `cypress/integration/test.js`

These tests run against a local dev server backed by `oidc-provider` — **no real Auth0 tenant or credentials required**. The dev server must be available at `http://localhost:3000`.

```bash
npm run test:integration   # start dev server + Cypress headlessly
```

Cross-browser CI (`.github/workflows/cross-browser.yml`) runs the same suite on Chrome, Edge, and Firefox on a Windows runner.

## Coverage

Jest produces `coverage/lcov.info` and an HTML report in `coverage/lcov-report/`. Codecov automatically uploads the report in the unit test CI job.
