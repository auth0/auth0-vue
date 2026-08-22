# Commands Reference

All commands are sourced from `package.json` scripts and CI workflows.

## Build

```bash
npm run build              # rimraf dist + rollup production build + ES2017 compatibility check
npm run dev                # rimraf dist + rollup in watch mode (dev server at http://localhost:3000)
npm run build:stats        # Build + open bundle visualizer stats
npm run print-bundle-size  # Print final gzip bundle size
```

## Testing

```bash
npm test                          # Jest unit tests with coverage (silent mode)
npm test -- --maxWorkers=2        # Exact CI command
npm run test:watch                # Jest in watch mode
npm run test:debug                # Jest with Node.js debugger attached
npm run test:es-check             # ES2017 compatibility check on dist/ (also runs inside npm run build)
```

## Integration Tests (Cypress)

```bash
npm run test:integration          # Start dev server + run Cypress headlessly (no real Auth0 tenant)
npm run test:open:integration     # Open Cypress interactive UI
npm run test:watch:integration    # Start dev server + open Cypress interactively
```

## Lint & Format

```bash
npm run lint              # ESLint on src/ (TypeScript + security rules)
npm run lint:security     # ESLint security-only pass on src/
```

Prettier runs as a pre-commit hook (`pretty-quick --staged`) — there is no standalone CI formatting step.

## Docs & Coverage

```bash
npm run docs              # TypeDoc API docs generation
npm run serve:coverage    # Serve coverage/lcov-report locally
```
