/* eslint-disable @typescript-eslint/no-empty-interface */
import type {
  Auth0ClientOptions,
  LogoutOptions as SPALogoutOptions,
  RedirectLoginOptions as SPARedirectLoginOptions
} from '@auth0/auth0-spa-js';
import { AppState } from './app-state';

/**
 * Configuration for the Auth0 Vue Client
 */
export interface Auth0VueClientOptions extends Auth0ClientOptions {}

export interface LogoutOptions extends Omit<SPALogoutOptions, 'onRedirect'> {}
export interface RedirectLoginOptions<TAppState = AppState>
  extends Omit<SPARedirectLoginOptions<TAppState>, 'onRedirect'> {}
