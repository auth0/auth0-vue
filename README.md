# @auth0/auth0-vue

Auth0 SDK for Vue 3 Applications using [Authorization Code Grant Flow with PKCE](https://auth0.com/docs/api-auth/tutorials/authorization-code-grant-pkce).

![Release](https://img.shields.io/github/v/release/auth0/auth0-vue)
[![Codecov](https://codecov.io/gh/auth0/auth0-vue/branch/main/graph/badge.svg)](https://codecov.io/gh/auth0/auth0-vue)
![Downloads](https://img.shields.io/npm/dw/@auth0/auth0-vue)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)
[![CircleCI](https://img.shields.io/circleci/build/github/auth0/auth0-vue)](https://circleci.com/gh/auth0/auth0-vue)

:books: [Documentation](#documentation) - :rocket: [Getting Started](#getting-started) - :computer: [API Reference](https://auth0.github.io/auth0-vue) - :speech_balloon: [Feedback](#feedback)

## Documentation

- [Quickstart](https://auth0.com/docs/quickstart/spa/vuejs) - our interactive guide for quickly adding login, logout and user information to a Vue 3 app using Auth0.
- [Sample App](https://github.com/auth0-samples/auth0-vue-samples/tree/master/01-Login) - a full-fledged Vue 3 application integrated with Auth0.
- [FAQs](./FAQ.md) - frequently asked questions about the auth0-vue SDK.
- [Examples](./EXAMPLES.md) - code samples for common Vue 3 authentication scenario's.
- [Docs site](https://www.auth0.com/docs) - explore our docs site and learn more about Auth0.

## Getting started

### Requirements

This library supports **Vue 3** applications.
For integrating Auth0 with a Vue 2 application, please read [the Vue 2 Tutorial](https://github.com/auth0/auth0-vue/blob/main/tutorial/vue2-login.md).

### Installation

Using [npm](https://npmjs.org):

```sh
npm install @auth0/auth0-vue
```

Using [yarn](https://yarnpkg.com):

```sh
yarn add @auth0/auth0-vue
```

## Getting Started

### Configure Auth0

Create a **Single Page Application** in the [Auth0 Dashboard](https://manage.auth0.com/#/applications).

> **If you're using an existing application**, verify that you have configured the following settings in your Single Page Application:
>
> - Click on the "Settings" tab of your application's page.
> - Ensure that "Token Endpoint Authentication Method" under "Application Properties" is set to "None"
> - Scroll down and click on the "Show Advanced Settings" link.
> - Under "Advanced Settings", click on the "OAuth" tab.
> - Ensure that "JsonWebToken Signature Algorithm" is set to `RS256` and that "OIDC Conformant" is enabled.

Next, configure the following URLs for your application under the "Application URIs" section of the "Settings" page:

- **Allowed Callback URLs**: `http://localhost:3000`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

> These URLs should reflect the origins that your application is running on. **Allowed Callback URLs** may also include a path, depending on where you're handling the callback (see below).

Take note of the **Client ID** and **Domain** values under the "Basic Information" section. You'll need these values in the next step.

### Configure the SDK

Create an instance of the `Auth0Plugin` by calling `createAuth0` and pass it to Vue's `app.use()`.

```js
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    client_id: '<AUTH0_CLIENT_ID>',
    redirect_uri: '<MY_CALLBACK_URL>'
  })
);

app.mount('#app');
```

For more code samples on how to integrate the **auth0-vue** SDK in your **Vue 3** application, have a look at our [examples](./EXAMPLES.md).

## Feedback

### Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](https://github.com/auth0/auth0-vue/blob/main/CONTRIBUTING.md)

### Raise an issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-vue/issues).

### Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy) details the procedure for disclosing security issues.

---

<p align="center">
  <img src="./auth0_black.png#gh-light-mode-only" width="150">
  <img src="./auth0_white.png#gh-dark-mode-only" width="150">
</p>
<p align="center">Auth0 is an easy to implement, adaptable authentication and authorization platform. To learn more checkout <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>
<p align="center">
This project is licensed under the MIT license. See the <a href="./LICENSE"> LICENSE</a> file for more info.</p>
