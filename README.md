# @auth0/auth0-vue

Auth0 SDK for Vue Applications using [Authorization Code Grant Flow with PKCE](https://auth0.com/docs/api-auth/tutorials/authorization-code-grant-pkce).

[![CircleCI](https://circleci.com/gh/auth0/auth0-vue/tree/main.svg?style=svg)](https://circleci.com/gh/auth0/auth0-vue/tree/main)
![Downloads](https://img.shields.io/npm/dw/@auth0/auth0-vue)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Documentation](#documentation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Support + Feedback](#support--feedback)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Vulnerability Reporting](#vulnerability-reporting)
- [What is Auth0](#what-is-auth0)
- [License](#license)

## Documentation

- [API reference](...)

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @auth0/auth0-vue@beta
```

Using [yarn](https://yarnpkg.com):

```sh
yarn add @auth0/auth0-vue@beta
```

## Getting Started

### Auth0 Configuration

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

### Configuring the plugin

Create an instance of the `Auth0Plugin` by calling `createAuth0` and pass it to Vue's `app.use()`.

```js

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

## Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](CONTRIBUTING.md)

## Support + Feedback

For support or to provide feedback, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-vue/issues).

## Frequently Asked Questions

For a rundown of common issues you might encounter when using the SDK, please check out [the FAQ](FAQ.md).

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## What is Auth0?

Auth0 helps you to easily:

- implement authentication with multiple identity providers, including social (e.g., Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g., Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc.)
- log in users with username/password databases, passwordless, or multi-factor authentication
- link multiple user accounts together
- generate signed JSON Web Tokens to authorize your API calls and flow the user identity securely
- access demographics and analytics detailing how, when, and where users are logging in
- enrich user profiles from other data sources using customizable JavaScript rules

[Why Auth0?](https://auth0.com/why-auth0)

## License

This project is licensed under the MIT license. See the [LICENSE](https://github.com/auth0/auth0-vue/blob/main/LICENSE) file for more info.
