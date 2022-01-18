import {
  Auth0Client,
  Auth0ClientOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  LogoutOptions,
  LogoutUrlOptions,
  PopupConfigOptions,
  PopupLoginOptions,
  RedirectLoginOptions
} from '@auth0/auth0-spa-js';
import { ref, readonly } from 'vue';

export const createAuth0ClientProxy = (options: Auth0ClientOptions) => {
  const client = new Auth0Client(options);
  const isLoading = ref(true);
  const isAuthenticated = ref(false);
  const user = ref({});
  const idTokenClaims = ref();

  const __refreshState = async () => {
    isAuthenticated.value = await client.isAuthenticated();
    user.value = await client.getUser();
    idTokenClaims.value = await client.getIdTokenClaims();
    isLoading.value = false;
  };

  const __proxy = async <T>(cb: () => T) => {
    const result = await cb();
    await __refreshState();
    return result;
  };

  return {
    isLoading: readonly(isLoading),
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    idTokenClaims: readonly(idTokenClaims),

    async loginWithRedirect(options?: RedirectLoginOptions) {
      return client.loginWithRedirect(options);
    },

    async loginWithPopup(
      options?: PopupLoginOptions,
      config?: PopupConfigOptions
    ) {
      return __proxy(() => client.loginWithPopup(options, config));
    },

    async logout(options?: LogoutOptions) {
      return __proxy(() => client.logout(options));
    },

    async getAccessTokenSilently(options?: GetTokenSilentlyOptions) {
      return __proxy(() => client.getTokenSilently(options));
    },

    async getAccessTokenWithPopup(
      options?: GetTokenWithPopupOptions,
      config?: PopupConfigOptions
    ) {
      return __proxy(() => client.getTokenWithPopup(options, config));
    },

    async checkSession(options?: GetTokenSilentlyOptions) {
      return __proxy(() => client.checkSession(options));
    },

    async handleRedirectCallback(url?: string) {
      return __proxy(() => client.handleRedirectCallback(url));
    },

    async buildAuthorizeUrl(options?: RedirectLoginOptions) {
      return client.buildAuthorizeUrl(options);
    },

    async buildLogoutUrl(options?: LogoutUrlOptions) {
      return client.buildLogoutUrl(options);
    }
  };
};

export type Auth0ClientProxy = ReturnType<typeof createAuth0ClientProxy>;
