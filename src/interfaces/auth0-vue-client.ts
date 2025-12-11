/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  User,
  IdToken,
  PopupLoginOptions,
  PopupConfigOptions,
  RedirectLoginResult,
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
  GetTokenWithPopupOptions,
  ConnectAccountRedirectResult,
  CustomFetchMinimalOutput,
  Fetcher,
  FetcherConfig
} from '@auth0/auth0-spa-js';
import type { Ref } from 'vue';
import type { AppState } from './app-state';
import type {
  LogoutOptions,
  RedirectLoginOptions
} from './auth0-vue-client-options';

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
  user: Ref<User | undefined>;

  /**
   * Contains all claims from the id_token if available.
   */
  idTokenClaims: Ref<IdToken | undefined>;

  /**
   * Contains an error that occured in the SDK
   */
  error: Ref<any>;

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
  loginWithRedirect(options?: RedirectLoginOptions<AppState>): Promise<void>;

  /**
   * After the browser redirects back to the callback page,
   * call `handleRedirectCallback` to handle success and error
   * responses from Auth0. If the response is successful, results
   * will be valid according to their expiration times.
   *
   * **Note:** The Auth0-Vue SDK handles this for you, unless you set `skipRedirectCallback` to true.
   * In that case, be sure to explicitly call `handleRedirectCallback` yourself.
   */
  handleRedirectCallback(
    url?: string
  ): Promise<
    RedirectLoginResult<AppState> | ConnectAccountRedirectResult<AppState>
  >;

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
  ): Promise<string | undefined>;

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
  logout(options?: LogoutOptions): Promise<void>;

  /**
   * ```js
   * const nonce = await getDpopNonce();
   * ```
   *
   * Retrieves the current DPoP nonce value for a specific identifier.
   *
   * The nonce is used to prevent replay attacks when using DPoP (Demonstrating Proof-of-Possession).
   * It may return `undefined` initially before the first server response.
   *
   * **Note:** Requires `useDpop: true` in the Auth0 client configuration.
   *
   * @param id - Optional identifier for the nonce. If omitted, returns the nonce for Auth0 requests.
   *             Use a custom identifier for tracking nonces for different API endpoints.
   */
  getDpopNonce(id?: string): Promise<string | undefined>;

  /**
   * ```js
   * await setDpopNonce('new-nonce-value', 'my-api');
   * ```
   *
   * Stores a DPoP nonce value for future use with a specific identifier.
   *
   * This is typically called automatically when the server provides a new nonce
   * in the `DPoP-Nonce` response header. Manual usage is only needed for advanced scenarios.
   *
   * **Note:** Requires `useDpop: true` in the Auth0 client configuration.
   *
   * @param nonce - The nonce value to store
   * @param id - Optional identifier for the nonce. If omitted, sets the nonce for Auth0 requests.
   *             Use a custom identifier for managing nonces for different API endpoints.
   */
  setDpopNonce(nonce: string, id?: string): Promise<void>;

  /**
   * ```js
   * const proof = await generateDpopProof({
   *   url: 'https://api.example.com/data',
   *   method: 'GET',
   *   accessToken: token
   * });
   * ```
   *
   * Generates a DPoP proof JWT that cryptographically binds an access token to the current client.
   *
   * The proof is a signed JWT that demonstrates possession of the private key associated with
   * the public key in the access token. This prevents token theft and replay attacks.
   *
   * **Note:** Requires `useDpop: true` in the Auth0 client configuration.
   * Most developers should use `createFetcher()` instead, which handles proof generation automatically.
   *
   * @param params - Configuration for generating the proof
   * @param params.url - The target URL for the API request
   * @param params.method - The HTTP method (GET, POST, etc.)
   * @param params.accessToken - The access token to bind to the proof
   * @param params.nonce - Optional nonce value from a previous server response
   */
  generateDpopProof(params: {
    url: string;
    method: string;
    accessToken: string;
    nonce?: string;
  }): Promise<string>;

  /**
   * ```js
   * const fetcher = createFetcher({
   *   dpopNonceId: 'my-api',
   *   baseUrl: 'https://api.example.com'
   * });
   *
   * const response = await fetcher.fetchWithAuth('/data', {
   *   method: 'GET'
   * });
   * const data = await response.json();
   * ```
   *
   * Creates a fetcher instance that automatically handles authentication for API requests.
   *
   * The fetcher automatically:
   * - Retrieves access tokens using `getAccessTokenSilently()`
   * - Adds proper `Authorization` headers
   * - Generates and includes DPoP proofs when using DPoP tokens
   * - Manages DPoP nonces and retries on nonce errors
   * - Handles token refreshing
   *
   * This is the recommended way to make authenticated API calls, especially when using DPoP.
   *
   * @param config - Configuration options for the fetcher
   */
  createFetcher<TOutput extends CustomFetchMinimalOutput = Response>(
    config?: FetcherConfig<TOutput>
  ): Fetcher<TOutput>;
}
