import { Auth0ClientOptions } from '@auth0/auth0-spa-js';
import { App } from 'vue';
import { Auth0ClientProxy, createAuth0ClientProxy } from './client.proxy';
import version from './version';

export const AUTH0_TOKEN = '$auth0';

/**
 * Configuration for the Auth0 Vue plugin
 */
export interface Auth0PluginOptions extends Auth0ClientOptions {
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
}

export class Auth0Plugin {
  constructor(private options: Auth0PluginOptions) {}

  install(app: App) {
    const proxy = createAuth0ClientProxy({
      ...this.options,
      auth0Client: {
        name: 'auth0-vue',
        version: version
      }
    });

    this.__checkSession(proxy);

    app.config.globalProperties[AUTH0_TOKEN] = proxy;
    app.provide(AUTH0_TOKEN, proxy);
  }

  private async __checkSession(proxy: Auth0ClientProxy) {
    const search = window.location.search;

    if (
      (search.includes('code=') || search.includes('error=')) &&
      search.includes('state=') &&
      !this.options.skipRedirectCallback
    ) {
      await proxy.handleRedirectCallback();
    } else {
      await proxy.checkSession();
    }

    window.history.replaceState({}, '', '/');
  }
}
