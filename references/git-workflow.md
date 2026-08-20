# Git Workflow Reference

## Branch Naming

No enforced convention. Use descriptive kebab-case branches:
- `feat/dpop-support`
- `fix/guard-loading-race`
- `chore/bump-spa-js`

## Commit Messages

No commitlint config detected. Use imperative mood, subject under 72 chars:

```
feat: add loginWithCustomTokenExchange
fix: refresh reactive state after passkey login
chore: bump @auth0/auth0-spa-js to 2.23.0
docs: add MyAccount API example to EXAMPLES.md
```

## Pull Requests

A local template exists at `.github/PULL_REQUEST_TEMPLATE.md`. Fill out all sections before requesting review:

- **Changes** — what changed and why; list affected classes and methods
- **References** — links to issues, tickets, or forum posts
- **Testing** — how reviewers can test; note anything not covered
- **Checklist:**
  - Unit test coverage added
  - Integration test (Cypress) coverage added if applicable
  - Tested on the latest platform version

The `Auth0/auth0-vue` CODEOWNERS are auto-assigned for review.

## Versioning

Two version sources must stay in sync:

| File | Purpose |
|------|---------|
| `package.json` `"version"` | npm release version |
| `src/version.ts` | Version string sent in the `Auth0-Client` telemetry header |

Updating one without the other means the npm package version and the header identifier disagree. Both must be bumped together when cutting a release.
