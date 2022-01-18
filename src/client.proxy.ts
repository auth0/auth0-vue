import {
  Auth0Client,
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

export const createAuth0ClientProxy = (options: Auth0ClientOptions) => {
  const client = new Auth0Client(options);
  const isLoading: Ref<boolean> = ref(true);
  const isAuthenticated: Ref<boolean> = ref(false);
  const user: Ref<User> = ref({});
  const idTokenClaims: Ref<IdToken> = ref();

  async function __refreshState() {
    isAuthenticated.value = await client.isAuthenticated();
    user.value = await client.getUser();
    idTokenClaims.value = await client.getIdTokenClaims();
    isLoading.value = false;
  }

  async function __proxy<T>(cb: () => T) {
    const result = await cb();
    await __refreshState();
    return result;
  }

  async function getAccessTokenSilently(
    options: GetTokenSilentlyOptions & { detailedResponse: true }
  ): Promise<GetTokenSilentlyVerboseResponse>;
  async function getAccessTokenSilently(
    options?: GetTokenSilentlyOptions
  ): Promise<string>;
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

    async handleRedirectCallback(url?: string): Promise<RedirectLoginResult> {
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
