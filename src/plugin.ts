import type { App, Ref } from 'vue';
import { readonly, ref } from 'vue';
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
 * @ignore
 */
export const client: Ref<Auth0VueClient> = ref(null);

/**
 * @ignore
 */
export class Auth0Plugin implements Auth0VueClient {
  private _client: Auth0Client;
  private _isLoading: Ref<boolean> = ref(true);
  private _isAuthenticated: Ref<boolean> = ref(false);
  private _user: Ref<User> = ref({});
  private _idTokenClaims: Ref<IdToken> = ref();
  private _error = ref(null);

  isLoading = readonly(this._isLoading);
  isAuthenticated = readonly(this._isAuthenticated);
  user = readonly(this._user);
  idTokenClaims = readonly(this._idTokenClaims);
  error = readonly(this._error);

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
    app.provide(AUTH0_INJECTION_KEY, this);

    client.value = this;
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
    this._isAuthenticated.value = await this._client.isAuthenticated();
    this._user.value = await this._client.getUser();
    this._idTokenClaims.value = await this._client.getIdTokenClaims();
    this._isLoading.value = false;
  }

  private async __proxy<T>(cb: () => T, refreshState = true) {
    let result;
    try {
      result = await cb();
      this._error.value = null;
    } catch (e) {
      this._error.value = e;
      throw e;
    } finally {
      if (refreshState) {
        await this.__refreshState();
      }
    }

    return result;
  }
}
