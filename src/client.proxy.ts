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

  async function __proxy<T>(cb: () => T) {
    let result;
    try {
      result = await cb();
      error.value = null;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      await __refreshState();
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

    buildLogoutUrl(options?: LogoutUrlOptions) {
      return client.buildLogoutUrl(options);
    }
  };
};

export interface Auth0VueClient {
  /**
   * The loading state of the SDK, `true` if the SDK is still processing the PKCE flow, `false` if the SDK has finished processing the PKCE flow.
   */
  isLoading: Ref<boolean>;

  /**
   * The authentication state, `true` if the user is authenticated, `false` if not.
   */
  isAuthenticated: Ref<boolean>;

  /**
   * Contains the information of the user if available.
   */
  user: Ref<User>;

  /**
   * Contains all claims from the id_token if available.
   */
  idTokenClaims: Ref<IdToken>;

  /**
   * Contains an error that occured in the SDK
   */
  error: Ref<any>;

  /**
   * ```js
   * await buildAuthorizeUrl(options);
   * ```
   *
   * Builds an `/authorize` URL for loginWithRedirect using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated.
   *
   * @param options
   */
  buildAuthorizeUrl(options?: RedirectLoginOptions): Promise<string>;

  /**
   * ```js
   * try {
   *  await loginWithPopup(options);
   * } catch(e) {
   *  if (e instanceof PopupCancelledError) {
   *    // Popup was closed before login completed
   *  }
   * }
   * ```
   *
   * Opens a popup with the `/authorize` URL using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated. If the response is successful,
   * results will be valid according to their expiration times.
   *
   * IMPORTANT: This method has to be called from an event handler
   * that was started by the user like a button click, for example,
   * otherwise the popup will be blocked in most browsers.
   *
   * @param options
   * @param config
   */
  loginWithPopup(
    options?: PopupLoginOptions,
    config?: PopupConfigOptions
  ): Promise<void>;

  /**
   * ```js
   * await loginWithRedirect(options);
   * ```
   *
   * Performs a redirect to `/authorize` using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated.
   *
   * @param options
   */
  loginWithRedirect(options?: RedirectLoginOptions): Promise<void>;

  /**
   * After the browser redirects back to the callback page,
   * call `handleRedirectCallback` to handle success and error
   * responses from Auth0. If the response is successful, results
   * will be valid according to their expiration times.
   *
   * **Note:** The Auth0-Vue SDK handles this for you, unless you set `skipRedirectCallback` to true.
   * In that case, be sure to explicitly call `handleRedirectCallback` yourself.
   */
  handleRedirectCallback(url?: string): Promise<RedirectLoginResult>;

  /**
   * ```js
   * await checkSession();
   * ```
   *
   * Check if the user is logged in using `getTokenSilently`. The difference
   * with `getTokenSilently` is that this doesn't return a token, but it will
   * pre-fill the token cache.
   *
   * This method also heeds the `auth0.{clientId}.is.authenticated` cookie, as an optimization
   *  to prevent calling Auth0 unnecessarily. If the cookie is not present because
   * there was no previous login (or it has expired) then tokens will not be refreshed.
   *
   * @param options
   */
  checkSession(options?: GetTokenSilentlyOptions): Promise<void>;

  /**
   * Fetches a new access token and returns the response from the /oauth/token endpoint, omitting the refresh token.
   *
   * @param options
   */
  getAccessTokenSilently(
    options: GetTokenSilentlyOptions & { detailedResponse: true }
  ): Promise<GetTokenSilentlyVerboseResponse>;

  /**
   * Fetches a new access token and returns it.
   *
   * @param options
   */
  getAccessTokenSilently(options?: GetTokenSilentlyOptions): Promise<string>;

  /**
   * ```js
   * const token = await getTokenWithPopup(options);
   * ```
   * Opens a popup with the `/authorize` URL using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated. If the response is successful,
   * results will be valid according to their expiration times.
   *
   * @param options
   * @param config
   */
  getAccessTokenWithPopup(
    options?: GetTokenWithPopupOptions,
    config?: PopupConfigOptions
  ): Promise<string>;

  /**
   * ```js
   * await buildLogoutUrl(options);
   * ```
   *
   * Builds a URL to the logout endpoint using the parameters provided as arguments.
   * @param options
   */
  buildLogoutUrl(options?: LogoutUrlOptions): string;
  /**
   * ```js
   * logout();
   * ```
   *
   * Clears the application session and performs a redirect to `/v2/logout`, using
   * the parameters provided as arguments, to clear the Auth0 session.
   *
   * **Note:** If you are using a custom cache, and specifying `localOnly: true`, and you want to perform actions or read state from the SDK immediately after logout, you should `await` the result of calling `logout`.
   *
   * If the `federated` option is specified it also clears the Identity Provider session.
   * If the `localOnly` option is specified, it only clears the application session.
   * It is invalid to set both the `federated` and `localOnly` options to `true`,
   * and an error will be thrown if you do.
   * [Read more about how Logout works at Auth0](https://auth0.com/docs/logout).
   *
   * @param options
   */
  logout(options?: LogoutOptions): Promise<void> | void;
}
