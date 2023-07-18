import type { App, Ref } from 'vue';
import { ref } from 'vue';
import type { Router } from 'vue-router';
import type {
  AppState,
  Auth0PluginOptions,
  Auth0VueClient,
  Auth0VueClientOptions,
  LogoutOptions,
  RedirectLoginOptions
} from './interfaces';
import { AUTH0_INJECTION_KEY, AUTH0_TOKEN } from './token';
import version from './version';
import type {
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
  GetTokenWithPopupOptions,
  IdToken,
  PopupConfigOptions,
  PopupLoginOptions,
  RedirectLoginResult
} from '@auth0/auth0-spa-js';
import { Auth0Client, User } from '@auth0/auth0-spa-js';
import { bindPluginMethods, deprecateRedirectUri } from './utils';

/**
 * Helper callback that's used by default before the plugin is installed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLUGIN_NOT_INSTALLED_HANDLER: any = () => {
  console.error(`Please ensure Auth0's Vue plugin is correctly installed.`);
};

/**
 * Helper client that's used by default before the plugin is installed.
 */
const PLUGIN_NOT_INSTALLED_CLIENT: Auth0VueClient = {
  isLoading: ref(false),
  isAuthenticated: ref(false),
  user: ref(undefined),
  idTokenClaims: ref(undefined),
  error: ref(null),
  loginWithPopup: PLUGIN_NOT_INSTALLED_HANDLER,
  loginWithRedirect: PLUGIN_NOT_INSTALLED_HANDLER,
  getAccessTokenSilently: PLUGIN_NOT_INSTALLED_HANDLER,
  getAccessTokenWithPopup: PLUGIN_NOT_INSTALLED_HANDLER,
  logout: PLUGIN_NOT_INSTALLED_HANDLER,
  checkSession: PLUGIN_NOT_INSTALLED_HANDLER,
  handleRedirectCallback: PLUGIN_NOT_INSTALLED_HANDLER
};

/**
 * @ignore
 */
export const client: Ref<Auth0VueClient> = ref(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PLUGIN_NOT_INSTALLED_CLIENT as any
);

/**
 * @ignore
 */
export class Auth0Plugin implements Auth0VueClient {
  private _client!: Auth0Client;
  public isLoading: Ref<boolean> = ref(true);
  public isAuthenticated: Ref<boolean> = ref(false);
  public user: Ref<User | undefined> = ref({});
  public idTokenClaims = ref<IdToken | undefined>();
  public error = ref<Error | null>(null);

  constructor(
    private clientOptions: Auth0VueClientOptions,
    private pluginOptions?: Auth0PluginOptions
  ) {
    // Vue Plugins can have issues when passing around the instance to `provide`
    // Therefor we need to bind all methods correctly to `this`.
    bindPluginMethods(this, ['constructor']);
  }

  install(app: App) {
    this._client = new Auth0Client({
      ...this.clientOptions,
      auth0Client: {
        name: 'auth0-vue',
        version: version
      }
    });

    this.__checkSession(app.config.globalProperties.$router);

    // eslint-disable-next-line security/detect-object-injection
    app.config.globalProperties[AUTH0_TOKEN] = this;
    app.provide(AUTH0_INJECTION_KEY, this as Auth0VueClient);

    client.value = this as Auth0VueClient;
  }

  async loginWithRedirect(options?: RedirectLoginOptions<AppState>) {
    deprecateRedirectUri(options);
    return this._client.loginWithRedirect(options);
  }

  async loginWithPopup(
    options?: PopupLoginOptions,
    config?: PopupConfigOptions
  ) {
    deprecateRedirectUri(options);
    return this.__proxy(() => this._client.loginWithPopup(options, config));
  }

  async logout(options?: LogoutOptions) {
    if (options?.openUrl || options?.openUrl === false) {
      return this.__proxy(() => this._client.logout(options));
    }

    return this._client.logout(options);
  }

  /* istanbul ignore next */
  async getAccessTokenSilently(
    options: GetTokenSilentlyOptions & { detailedResponse: true }
  ): Promise<GetTokenSilentlyVerboseResponse>;
  /* istanbul ignore next */
  async getAccessTokenSilently(
    options?: GetTokenSilentlyOptions
  ): Promise<string>;
  /* istanbul ignore next */
  async getAccessTokenSilently(
    options: GetTokenSilentlyOptions = {}
  ): Promise<string | GetTokenSilentlyVerboseResponse> {
    deprecateRedirectUri(options);
    return this.__proxy(() => this._client.getTokenSilently(options));
  }

  async getAccessTokenWithPopup(
    options?: GetTokenWithPopupOptions,
    config?: PopupConfigOptions
  ) {
    deprecateRedirectUri(options);
    return this.__proxy(() => this._client.getTokenWithPopup(options, config));
  }

  async checkSession(options?: GetTokenSilentlyOptions) {
    return this.__proxy(() => this._client.checkSession(options));
  }

  async handleRedirectCallback(
    url?: string
  ): Promise<RedirectLoginResult<AppState>> {
    return this.__proxy(() =>
      this._client.handleRedirectCallback<AppState>(url)
    );
  }

  private async __checkSession(router?: Router) {
    const search = window.location.search;

    try {
      if (
        (search.includes('code=') || search.includes('error=')) &&
        search.includes('state=') &&
        !this.pluginOptions?.skipRedirectCallback
      ) {
        const result = await this.handleRedirectCallback();
        const appState = result?.appState;
        const target = appState?.target ?? '/';

        window.history.replaceState({}, '', '/');

        if (router) {
          router.push(target);
        }

        return result;
      } else {
        await this.checkSession();
      }
    } catch (e) {
      // __checkSession should never throw an exception as it will fail installing the plugin.
      // Instead, errors during __checkSession are propagated using the errors property on `useAuth0`.

      window.history.replaceState({}, '', '/');

      if (router) {
        router.push(this.pluginOptions?.errorPath || '/');
      }
    }
  }

  private async __refreshState() {
    this.isAuthenticated.value = await this._client.isAuthenticated();
    this.user.value = await this._client.getUser();
    this.idTokenClaims.value = await this._client.getIdTokenClaims();
    this.isLoading.value = false;
  }

  private async __proxy<T>(cb: () => T, refreshState = true) {
    let result;
    try {
      result = await cb();
      this.error.value = null;
    } catch (e) {
      this.error.value = e as Error;
      throw e;
    } finally {
      if (refreshState) {
        await this.__refreshState();
      }
    }

    return result;
  }
}
