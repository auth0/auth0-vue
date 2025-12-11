export { Auth0Plugin } from './plugin';
export * from './interfaces';
export * from './guard';

export {
  User,
  InMemoryCache,
  LocalStorageCache,
  UseDpopNonceError
} from '@auth0/auth0-spa-js';

export type {
  AuthorizationParams,
  PopupLoginOptions,
  PopupConfigOptions,
  GetTokenWithPopupOptions,
  LogoutUrlOptions,
  CacheLocation,
  GetTokenSilentlyOptions,
  IdToken,
  ICache,
  Cacheable,
  FetcherConfig,
  Fetcher,
  CustomFetchMinimalOutput
} from '@auth0/auth0-spa-js';
