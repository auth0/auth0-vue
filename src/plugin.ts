import { App, Ref, ref } from 'vue';
import { createAuth0ClientProxy } from './client.proxy';
import {
  Auth0PluginOptions,
  Auth0VueClient,
  Auth0VueClientOptions
} from './interfaces';
import { AUTH0_INJECTION_KEY, AUTH0_TOKEN } from './token';
import version from './version';

/**
 * @ignore
 */
export const client: Ref<Auth0VueClient> = ref(null);

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
      app.config.globalProperties
    );

    this.__checkSession(proxy);

    app.config.globalProperties[AUTH0_TOKEN] = proxy;
    app.provide(AUTH0_INJECTION_KEY, proxy);

    client.value = proxy;
  }

  private async __checkSession(proxy: Auth0VueClient) {
    const search = window.location.search;

    if (
      (search.includes('code=') || search.includes('error=')) &&
      search.includes('state=') &&
      !this.pluginOptions?.skipRedirectCallback
    ) {
      await proxy.handleRedirectCallback();
    } else {
      await proxy.checkSession();
    }
  }
}
