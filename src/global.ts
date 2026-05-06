export { Auth0Plugin } from './plugin';
export * from './interfaces';
export * from './guard';

export {
  User,
  InMemoryCache,
  LocalStorageCache,
  UseDpopNonceError,
  MfaRequiredError,
  MfaError,
  MfaListAuthenticatorsError,
  MfaEnrollmentError,
  MfaChallengeError,
  MfaVerifyError,
  MfaEnrollmentFactorsError
} from '@auth0/auth0-spa-js';

export type {
  AuthorizationParams,
  InteractiveErrorHandler,
  CustomTokenExchangeOptions,
  TokenEndpointResponse,
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
  CustomFetchMinimalOutput,
  MfaApiClient,
  Authenticator,
  AuthenticatorType,
  OobChannel,
  MfaFactorType,
  EnrollParams,
  EnrollOtpParams,
  EnrollSmsParams,
  EnrollVoiceParams,
  EnrollEmailParams,
  EnrollPushParams,
  EnrollmentResponse,
  OtpEnrollmentResponse,
  OobEnrollmentResponse,
  ChallengeAuthenticatorParams,
  ChallengeResponse,
  VerifyParams,
  MfaGrantType,
  EnrollmentFactor
} from '@auth0/auth0-spa-js';
