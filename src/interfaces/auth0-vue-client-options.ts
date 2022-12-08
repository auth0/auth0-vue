import type {
  Auth0ClientOptions,
  LogoutOptions as SPALogoutOptions,
  RedirectLoginOptions as SPARedirectLoginOptions
} from '@auth0/auth0-spa-js';

/**
 * Configuration for the Auth0 Vue Client
 */
export interface Auth0VueClientOptions extends Auth0ClientOptions {}

export interface LogoutOptions extends Omit<SPALogoutOptions, 'onRedirect'> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedirectLoginOptions<TAppState = any> extends Omit<SPARedirectLoginOptions<TAppState>, 'onRedirect'> {}