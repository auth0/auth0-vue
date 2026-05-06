# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Auth0 SDK for Vue 3 applications. It provides authentication and authorization using Auth0's Authorization Code Grant Flow with PKCE. The SDK wraps `@auth0/auth0-spa-js` and exposes it as a Vue plugin.

## Common Commands

### Development
- `npm start` or `npm run dev` - Start development server at http://localhost:3000 with live reload and a playground app
- `DEV_PORT=8080 npm start` - Start development server on custom port

### Testing
- `npm test` - Run unit tests with Jest (includes coverage)
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:integration` - Run Cypress integration tests
- `npm run test:watch:integration` - Run integration tests continuously with dev server
- `npm run test:debug` - Debug unit tests with Node inspector

### Building
- `npm run build` - Build production bundles (UMD, ESM, CJS) and run ES compatibility checks
- `npm run build:stats` - Build with bundle statistics and open visualization
- `WITH_STATS=true npm run build` - Build with bundle size stats in terminal

### Code Quality
- `npm run lint` - Lint TypeScript files in src/
- `npm run lint:security` - Run security-focused ESLint checks
- `npm run print-bundle-size` - Display final bundle size of distribution files

### Documentation
- `npm run docs` - Generate TypeDoc API documentation

### Serving Reports
- `npm run serve:coverage` - Serve coverage report at http://localhost:5000
- `npm run serve:stats` - Serve bundle statistics at http://localhost:5000

## Architecture

### Core Components

**Auth0Plugin** (`src/plugin.ts`):
- Main plugin class implementing the Auth0VueClient interface
- Installed via `app.use()` and provides Auth0 client to all components
- Manages reactive state: `isLoading`, `isAuthenticated`, `user`, `idTokenClaims`, `error`
- Wraps `@auth0/auth0-spa-js` Auth0Client with Vue-specific functionality
- Handles redirect callbacks automatically on initialization (can be disabled with `skipRedirectCallback` option)
- Uses `__proxy()` method to wrap SDK calls, refresh state, and handle errors

**createAuth0** (`src/index.ts`):
- Factory function that creates an Auth0Plugin instance
- Takes `Auth0VueClientOptions` and optional `Auth0PluginOptions`

**useAuth0** (`src/index.ts`):
- Composition API function using Vue's `inject()` to access the Auth0 client
- Returns the Auth0VueClient instance with reactive properties and methods

**Route Guards** (`src/guard.ts`):
- `createAuthGuard()` - Creates a route guard that redirects to Auth0 if not authenticated
- `authGuard()` - Direct guard function for simple use cases
- Guards wait for `isLoading` to complete before checking authentication
- Automatically passes current route path to Auth0 via `appState.target` for post-login redirect

### Key Patterns

1. **Plugin Installation Flow**:
   - Plugin is installed via `app.use(createAuth0(options))`
   - During install, creates Auth0Client from `@auth0/auth0-spa-js`
   - Checks URL for OAuth callback params (code, state, error)
   - If callback detected, calls `handleRedirectCallback()` and routes to target
   - Otherwise, calls `checkSession()` to restore existing session
   - Sets up global property `$auth0` and provides via injection key

2. **State Management**:
   - All auth state is reactive using Vue refs
   - State is updated after each auth operation via `__refreshState()`
   - Errors from auth operations are captured in `error` ref
   - The `client` ref in plugin.ts provides global access to current auth state

3. **Options API Support**:
   - Plugin adds `$auth0` to component instances via globalProperties
   - Composition API uses `useAuth0()` to get same client instance

### Testing Structure

- **Unit tests**: Located in `__tests__/` directory
  - `plugin.test.ts` - Tests for Auth0Plugin functionality
  - `guard.test.ts` - Tests for route guard behavior
  - Run with Jest in jsdom environment

- **Integration tests**: Located in `cypress/integration/`
  - Uses Cypress with local OIDC provider
  - Tests against the playground app

### Build Output

The build produces multiple formats:
- **UMD** (`dist/auth0-vue.production.js`) - Browser bundle for script tags
- **ESM** (`dist/auth0-vue.production.esm.js`) - For modern module bundlers
- **CJS** (`dist/lib/auth0-vue.cjs.js`) - For Node/CommonJS environments

All builds are ES2017 compatible and checked via `npm run test:es-check`.

### Playground App

Located in `playground/` directory:
- Simple Vue 3 app for manual testing and integration test scenarios
- Served during development at http://localhost:3000
- Uses Vue Router with auth guards
- Preconfigured with Auth0 test tenant (can be customized)

### Key Dependencies

- `@auth0/auth0-spa-js` - Core Auth0 SPA SDK (wrapped by this library)
- `vue` - Vue 3 framework
- `vue-router` - Optional peer dependency for route guards
