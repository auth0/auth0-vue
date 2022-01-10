import { Auth0ClientOptions } from '@auth0/auth0-spa-js';
import { App } from 'vue';
import { Auth0ClientProxy } from './client.proxy';
import version from './version';

export const AUTH0_TOKEN = '$auth0';

export interface Auth0PluginOptions {
  domain: string;
  clientId: string;

  [key: string]: any;
}

function pluginOptionsToClientOptions(
  options: Auth0PluginOptions
): Auth0ClientOptions {
  const { domain, clientId, ...rest } = options;
  return {
    ...rest,
    domain: domain,
    client_id: clientId,
    auth0Client: {
      name: 'auth0-vue',
      version: version
    }
  };
}

export class Auth0Plugin {
  constructor(private options: Auth0PluginOptions, private vue?: any) {}

  install(app: App) {
    const proxy = new Auth0ClientProxy(
      pluginOptionsToClientOptions(this.options),
      this.vue
    );

    this.__checkSession(proxy);

    app.config.globalProperties[AUTH0_TOKEN] = proxy;
    app.provide(AUTH0_TOKEN, proxy);
  }

  private async __checkSession(proxy: Auth0ClientProxy) {
    const search = window.location.search;

    if (
      (search.includes('code=') || search.includes('error=')) &&
      search.includes('state=')
    ) {
      await proxy.handleRedirectCallback();
    } else {
      await proxy.checkSession();
    }

    window.history.replaceState({}, '', '/');
  }
}
