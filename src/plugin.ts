import { Auth0ClientOptions } from '@auth0/auth0-spa-js';
import { App } from 'vue';
import { Router } from 'vue-router';
import { createAuth0ClientProxy, Auth0VueClient } from './client.proxy';
import { AUTH0_INJECTION_KEY, AUTH0_TOKEN } from './token';
import version from './version';

/**
 * Configuration for the Auth0 Vue Client
 */
export interface Auth0VueClientOptions extends Auth0ClientOptions {}

/**
 * Additional Configuration for the Auth0 Vue plugin
 */
export interface Auth0PluginOptions {
  /**
   * By default, if the page URL has code and state parameters, the SDK will assume they are for
   * an Auth0 application and attempt to exchange the code for a token.
   * In some cases the code might be for something else (e.g. another OAuth SDK). In these
   * instances you can instruct the client to ignore them by setting `skipRedirectCallback`.
   *
   * ```js
   * createAuth0({
   *   skipRedirectCallback: window.location.pathname === '/other-callback'
   * })
   * ```
   *
   * **Note**: In the above example, `/other-callback` is an existing route that will be called
   * by any other OAuth provider with a `code` (or `error` in case when something went wrong) and `state`.
   *
   */
  skipRedirectCallback?: boolean;

  router?: Router;
}

/**
 * @ignore
 */
export class Auth0Plugin {
  constructor(
    private clientOptions: Auth0VueClientOptions,
    private pluginOptions?: Auth0PluginOptions
  ) {}

  install(app: App) {
    const proxy = createAuth0ClientProxy(
      {
        ...this.clientOptions,
        auth0Client: {
          name: 'auth0-vue',
          version: version
        }
      },
      this.pluginOptions?.router
    );

    this.__checkSession(proxy);

    app.config.globalProperties[AUTH0_TOKEN] = proxy;
    app.provide(AUTH0_INJECTION_KEY, proxy);
  }

  private async __checkSession(proxy: Auth0VueClient) {
    const search = window.location.search;

    if (
      (search.includes('code=') || search.includes('error=')) &&
      search.includes('state=') &&
      !this.pluginOptions.skipRedirectCallback
    ) {
      await proxy.handleRedirectCallback();
    } else {
      await proxy.checkSession();
    }

    window.history.replaceState({}, '', '/');
  }
}
