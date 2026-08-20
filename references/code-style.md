# Code Style Reference

## Linter & Formatter

- **ESLint:** `@typescript-eslint/recommended` + `eslint-plugin-security` (`.eslintrc`)
- **Prettier:** single quotes, 80-char print width, no trailing commas, `arrowParens: 'avoid'` (`.prettierrc`)
- **Pre-commit hook:** `pretty-quick --staged` formats staged files automatically

## TypeScript Config

- `strict: true`, `noImplicitAny: true`, `verbatimModuleSyntax: true` (`tsconfig.json`)
- Target: ES2017 (verified by `npm run test:es-check` on the dist output)
- Any use of `any` requires an `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment

## Naming Conventions

| Kind | Convention | Example |
|------|-----------|---------|
| Classes | PascalCase | `Auth0Plugin` |
| Interfaces | PascalCase (no `I` prefix) | `Auth0VueClientOptions` |
| Exported functions | camelCase | `createAuth0`, `useAuth0` |
| Private plugin methods | `__doubleUnderscore` | `__proxy`, `__checkSession` |
| Injection token constants | SCREAMING_SNAKE_CASE | `AUTH0_INJECTION_KEY`, `AUTH0_TOKEN` |
| Type-only imports | `import type` | `import type { Auth0VueClient } from './interfaces'` |

## Key Patterns

### Reactive State

All public state on `Auth0Plugin` is a Vue `Ref<T>` for template reactivity:

```typescript
// ✅ Good
public isAuthenticated: Ref<boolean> = ref(false);

// ❌ Bad — no reactivity, components won't update
public isAuthenticated: boolean = false;
```

### Proxy Pattern for State Refresh

Methods that mutate auth state must route through `__proxy()` to update `isAuthenticated`, `user`, and `idTokenClaims` and capture errors into the `error` ref:

```typescript
// ✅ Good
async loginWithPopup(options?: PopupLoginOptions) {
  return this.__proxy(() => this._client.loginWithPopup(options));
}

// ❌ Bad — reactive state stays stale; error ref never updates
async loginWithPopup(options?: PopupLoginOptions) {
  return this._client.loginWithPopup(options);
}
```

### Import Style

```typescript
// ✅ Good — verbatimModuleSyntax requires 'import type' for type-only imports
import type { Auth0VueClient } from './interfaces';
import { ref } from 'vue';

// ❌ Bad — type import without 'import type' fails verbatimModuleSyntax
import { Auth0VueClient } from './interfaces';
```

### Method Binding

New methods added to `Auth0Plugin` are automatically bound to `this` by `bindPluginMethods` in the constructor — don't assign methods as arrow function properties, which bypasses the prototype and breaks the binding.
