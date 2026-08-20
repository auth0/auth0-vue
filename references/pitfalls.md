# Common Pitfalls

## 1. Forgetting `__proxy()` on new auth methods

Any `Auth0Plugin` method that mutates auth state must call `__proxy()` — it refreshes `isAuthenticated`, `user`, and `idTokenClaims` and captures errors into the `error` ref. Calling `this._client` directly without `__proxy()` leaves reactive state stale and components won't re-render.

Exception: `loginWithRedirect` and `logout` (without `openUrl`) are not wrapped because they navigate away or complete inline; wrapping them causes a double state refresh.

## 2. MFA methods bypass the error ref

`mfa.*` methods are delegated directly from `this._client.mfa` without going through `__proxy()`. Errors from MFA operations are **not** captured in the `error` ref returned by `useAuth0()`. Always wrap `mfa` calls in `try/catch` and handle typed errors (`MfaVerifyError`, `MfaChallengeError`) directly. Call `checkSession()` after a successful `mfa.verify()` to refresh reactive state.

The `passkey.*` methods **do** go through `__proxy()` via inline wrappers in the `install()` method.

## 3. Use `createFetcher()` for DPoP-protected API calls

When `useDpop: true` is configured, access tokens are DPoP-bound. Calling `fetch()` directly with the token bypasses proof generation and will be rejected by the resource server. Use `createFetcher()`, which handles proof generation, nonce management, and automatic retry on nonce errors.

## 4. Method binding is required for `provide/inject`

Vue's `provide()` passes the plugin instance to child components. Methods called from an injected reference lose their `this` context unless explicitly bound. The `Auth0Plugin` constructor calls `bindPluginMethods(this, ['constructor'])` to bind all prototype methods automatically. Don't add methods as arrow-function class fields (`myMethod = () => ...`) — that bypasses the prototype and breaks `bindPluginMethods`.

## 5. `skipRedirectCallback` stalls the PKCE flow

If `pluginOptions.skipRedirectCallback` is `true`, `__checkSession` skips calling `handleRedirectCallback` even when `code=` + `state=` are present in the URL. The app must call `handleRedirectCallback` manually in this case. Setting this flag incorrectly causes the PKCE flow to stall silently with no error.

## 6. `src/version.ts` is the telemetry version, not the npm version

The string exported from `src/version.ts` is sent in the `Auth0-Client` header (the SDK telemetry identifier). The `package.json` `"version"` field is the npm release version. They are maintained separately and must both be updated when cutting a release — see [references/git-workflow.md](git-workflow.md).
