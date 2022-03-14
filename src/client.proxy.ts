import {
  Auth0Client as SpaAuth0Client,
  Auth0ClientOptions,
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
import { ref, readonly, Ref } from 'vue';
import { Router } from 'vue-router';
import { Auth0VueClient, AppState } from './interfaces';

/**
 * @ignore
 */
export const createAuth0ClientProxy = (
  options: Auth0ClientOptions
): Auth0VueClient => {
  const client = new SpaAuth0Client(options);
  const isLoading: Ref<boolean> = ref(true);
  const isAuthenticated: Ref<boolean> = ref(false);
  const user: Ref<User> = ref({});
  const idTokenClaims: Ref<IdToken> = ref();
  const error = ref(null);

  async function __refreshState() {
    isAuthenticated.value = await client.isAuthenticated();
    user.value = await client.getUser();
    idTokenClaims.value = await client.getIdTokenClaims();
    isLoading.value = false;
  }

  async function __proxy<T>(cb: () => T, refreshState = true) {
    let result;
    try {
      result = await cb();
      error.value = null;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      if (refreshState) {
        await __refreshState();
      }
    }

    return result;
  }

  /* istanbul ignore next */
  async function getAccessTokenSilently(
    options: GetTokenSilentlyOptions & { detailedResponse: true }
  ): Promise<GetTokenSilentlyVerboseResponse>;
  /* istanbul ignore next */
  async function getAccessTokenSilently(
    options?: GetTokenSilentlyOptions
  ): Promise<string>;
  /* istanbul ignore next */
  async function getAccessTokenSilently(
    options: GetTokenSilentlyOptions = {}
  ): Promise<string | GetTokenSilentlyVerboseResponse> {
    return __proxy(() => client.getTokenSilently(options));
  }

  return {
    isLoading: readonly(isLoading),
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    idTokenClaims: readonly(idTokenClaims),
    error: readonly(error),

    async loginWithRedirect(options?: RedirectLoginOptions<AppState>) {
      return client.loginWithRedirect(options);
    },

    async loginWithPopup(
      options?: PopupLoginOptions,
      config?: PopupConfigOptions
    ) {
      return __proxy(() => client.loginWithPopup(options, config));
    },

    async logout(options?: LogoutOptions) {
      return __proxy(() => client.logout(options), options?.localOnly);
    },

    getAccessTokenSilently,

    async getAccessTokenWithPopup(
      options?: GetTokenWithPopupOptions,
      config?: PopupConfigOptions
    ) {
      return __proxy(() => client.getTokenWithPopup(options, config));
    },

    async checkSession(options?: GetTokenSilentlyOptions) {
      return __proxy(() => client.checkSession(options));
    },

    async handleRedirectCallback(
      url?: string
    ): Promise<RedirectLoginResult<AppState>> {
      return __proxy(() => client.handleRedirectCallback<AppState>(url));
    },

    async buildAuthorizeUrl(options?: RedirectLoginOptions) {
      return client.buildAuthorizeUrl(options);
    },

    buildLogoutUrl(options?: LogoutUrlOptions) {
      return client.buildLogoutUrl(options);
    }
  };
};
