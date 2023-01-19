# Change Log

## [v2.0.0](https://github.com/auth0/auth0-vue/tree/v2.0.0-beta.0) (2023-01-19)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.3...v2.0.0)

Auth0-Vue v2 includes many significant changes compared to v1:

- Remove polyfills from bundles
- Introduce `authorizationParams` and `logoutParams` to hold properties sent to Auth0
- Remove `buildAuthorizeUrl` and `buildLogoutUrl`
- Remove `redirectMethod`, and replace by `openUrl`
- Remove `localOnly` from `logout` in favor of `openUrl`
- Rework `ignoreCache` to `cacheMode` and introduce `cache-only`
- Use form-encoded data by default
- Do not fallback to refreshing tokens via iframe method by default
- Remove `advancedOptions.defaultScope` and replace with `scope`

As with any major version bump, v2 of Auth0-Vue contains a set of breaking changes. **Please review [the migration guide](./MIGRATION_GUIDE.md) thoroughly to understand the changes required to migrate your application to v2.**

## [v1.0.3](https://github.com/auth0/auth0-vue/tree/v1.0.3) (2023-01-12)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.2...v1.0.3)

**Security**

- Upgrade @auth0/auth0-spa-js to 1.22.6 [\#191](https://github.com/auth0/auth0-vue/pull/191) ([ewanharris](https://github.com/ewanharris))

This patch release is identical to `1.0.2` but has been released to ensure tooling no longer detects a vulnerable version of jsonwebtoken being used by `@auth0/auth0-spa-js`.

Even though `1.22.5` of `@auth0/auth0-spa-js` was not vulnerable for the related [CVE](https://unit42.paloaltonetworks.com/jsonwebtoken-vulnerability-cve-2022-23529/) because of the fact that `jsonwebtoken` is a devDependency of `@auth0/auth0-spa-js`, we are cutting a release to ensure build tools no longer report our SDK's that use `@auth0/auth0-spa-js` as vulnerable to the mentioned CVE.

## [v2.0.0-beta.0](https://github.com/auth0/auth0-vue/tree/v2.0.0-beta.0) (2022-12-13)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.2...v2.0.0-beta.0)

Auth0-Vue v2 includes many significant changes compared to v1:

- Remove polyfills from bundles
- Introduce `authorizationParams` and `logoutParams` to hold properties sent to Auth0
- Remove `buildAuthorizeUrl` and `buildLogoutUrl`
- Remove `redirectMethod`, and replace by `openUrl`
- Remove `localOnly` from `logout` in favor of `openUrl`
- Rework `ignoreCache` to `cacheMode` and introduce `cache-only`
- Use form-encoded data by default
- Do not fallback to refreshing tokens via iframe method by default
- Remove `advancedOptions.defaultScope` and replace with `scope`

As with any major version bump, v2 of Auth0-Vue contains a set of breaking changes. **Please review [the migration guide](./MIGRATION_GUIDE.md) thoroughly to understand the changes required to migrate your application to v2.**

## [v1.0.2](https://github.com/auth0/auth0-vue/tree/v1.0.2) (2022-06-22)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.1...v1.0.2)

**Fixed**

- Do not refreshState when logging out using redirect [\#128](https://github.com/auth0/auth0-vue/pull/128) ([frederikprijck](https://github.com/frederikprijck))

## [v1.0.1](https://github.com/auth0/auth0-vue/tree/v1.0.1) (2022-05-02)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.0...v1.0.1)

**Changed**

- Merge plugin and proxy class to allow usage outside components [\#106](https://github.com/auth0/auth0-vue/pull/106) ([frederikprijck](https://github.com/frederikprijck))

**Fixed**

- Bind all methods of Auth0VueClient to this [\#110](https://github.com/auth0/auth0-vue/pull/110) ([frederikprijck](https://github.com/frederikprijck))

## [v1.0.0](https://github.com/auth0/auth0-vue/tree/v1.0.0) (2022-03-14)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.0-beta.2...v1.0.0)

This is the first version of the Auth0 SDK for Vue 3 applications, making integrating Auth0 as seamlessly as possible.

To learn more, have a look at the following documents:

- [Quickstart Guide](https://auth0.com/docs/quickstart/spa/vuejs)
- [API Reference](https://auth0.github.io/auth0-vue)

For support or to provide feedback, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-vue/issues).

### Changes since v1.0.0-beta.2

**Added**

- Support a guard without calling createAuthGuard [\#80](https://github.com/auth0/auth0-vue/pull/80) ([frederikprijck](https://github.com/frederikprijck))

**Fixed**

- Refactor history.replaceState usage [\#89](https://github.com/auth0/auth0-vue/pull/89) ([Soviut](https://github.com/Soviut))
- FIX logout options not required [\#92](https://github.com/auth0/auth0-vue/pull/92) ([Soviut](https://github.com/Soviut))
- Ensure tarball contains all the required typings [\#77](https://github.com/auth0/auth0-vue/pull/77) ([frederikprijck](https://github.com/frederikprijck))

## [v1.0.0-beta.2](https://github.com/auth0/auth0-vue/tree/v1.0.0-beta.2) (2022-03-02)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.0-beta.1...v1.0.0-beta.2)

**Added**

- Support a guard without calling createAuthGuard [\#80](https://github.com/auth0/auth0-vue/pull/80) ([frederikprijck](https://github.com/frederikprijck))

## [v1.0.0-beta.1](https://github.com/auth0/auth0-vue/tree/v1.0.0-beta.1) (2022-02-25)

[Full Changelog](https://github.com/auth0/auth0-vue/compare/v1.0.0-beta.0...v1.0.0-beta.1)

**Fixed**

- Ensure tarball contains all the required typings [\#77](https://github.com/auth0/auth0-vue/pull/77) ([frederikprijck](https://github.com/frederikprijck))
