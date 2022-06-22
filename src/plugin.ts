import { App, readonly, Ref, ref } from 'vue';
import { Router } from 'vue-router';
import {
  AppState,
  Auth0PluginOptions,
  Auth0VueClient,
  Auth0VueClientOptions
} from './interfaces';
import { AUTH0_INJECTION_KEY, AUTH0_TOKEN } from './token';
import version from './version';
import {
  Auth0Client,
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  LogoutUrlOptions,
  PopupConfigOptions,
  PopupLoginOptions,
  RedirectLoginOptions,
  RedirectLoginResult,
  User
} from '@auth0/auth0-spa-js';
import { bindPluginMethods } from './utils';

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

    app.config.globalProperties[AUTH0_TOKEN] = this;
    app.provide(AUTH0_INJECTION_KEY, this);

    client.value = this;
  }

  async loginWithRedirect(options?: RedirectLoginOptions<AppState>) {
    return this._client.loginWithRedirect(options);
  }

  async loginWithPopup(
    options?: PopupLoginOptions,
    config?: PopupConfigOptions
  ) {
    return this.__proxy(() => this._client.loginWithPopup(options, config));
  }

  async logout(options?: LogoutOptions) {
    if (options?.localOnly) {
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
    return this.__proxy(() => this._client.getTokenSilently(options));
  }

  async getAccessTokenWithPopup(
    options?: GetTokenWithPopupOptions,
    config?: PopupConfigOptions
  ) {
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

  async buildAuthorizeUrl(options?: RedirectLoginOptions) {
    return this._client.buildAuthorizeUrl(options);
  }

  buildLogoutUrl(options?: LogoutUrlOptions) {
    return this._client.buildLogoutUrl(options);
  }

  private async __checkSession(router?: Router) {
    const search = window.location.search;

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
