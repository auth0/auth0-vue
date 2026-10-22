import { App } from 'vue';
import {
  createAuth0,
  MfaRequiredError,
  PasskeyError,
  PasskeyGetTokenError,
  PasskeyVerificationRequiredError
} from '../src/index';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals';

const passkeySignupMock = jest
  .fn<any>()
  .mockResolvedValue({ access_token: 'passkey-token', id_token: 'passkey-id-token' });
const passkeyLoginMock = jest
  .fn<any>()
  .mockResolvedValue({ access_token: 'passkey-token', id_token: 'passkey-id-token' });
const passkeyContinueSignupMock = jest
  .fn<any>()
  .mockResolvedValue({ access_token: 'passkey-token', id_token: 'passkey-id-token' });
const passkeyGetSignupChallengeMock = jest
  .fn<any>()
  .mockResolvedValue({ authSession: 'auth-session-a', publicKey: {} });
const passkeyGetLoginChallengeMock = jest
  .fn<any>()
  .mockResolvedValue({ authSession: 'auth-session-b', publicKey: {} });
const passkeyGetTokenWithPasskeyMock = jest
  .fn<any>()
  .mockResolvedValue({ access_token: 'passkey-token', id_token: 'passkey-id-token' });

const checkSessionMock = jest.fn<any>().mockResolvedValue(null);
const handleRedirectCallbackMock = jest.fn<any>().mockResolvedValue(null);
const isAuthenticatedMock = jest.fn<any>().mockResolvedValue(false);
const getUserMock = jest.fn<any>().mockResolvedValue(null);
const getIdTokenClaimsMock = jest.fn<any>().mockResolvedValue(null);

jest.mock('vue', () => {
  const originalModule = jest.requireActual('vue');
  return {
    __esModule: true,
    ...(originalModule as any),
    inject: jest.fn()
  };
});

jest.mock('@auth0/auth0-spa-js', () => {
  return {
    Auth0Client: jest.fn().mockImplementation(() => {
      return {
        checkSession: checkSessionMock,
        handleRedirectCallback: handleRedirectCallbackMock,
        loginWithRedirect: jest.fn<any>().mockResolvedValue(null),
        loginWithPopup: jest.fn<any>().mockResolvedValue(null),
        logout: jest.fn<any>(),
        isAuthenticated: isAuthenticatedMock,
        getUser: getUserMock,
        getIdTokenClaims: getIdTokenClaimsMock,
        getTokenSilently: jest.fn<any>().mockResolvedValue(null),
        getTokenWithPopup: jest.fn<any>().mockResolvedValue(null),
        getDpopNonce: jest.fn<any>().mockResolvedValue(undefined),
        setDpopNonce: jest.fn<any>().mockResolvedValue(undefined),
        generateDpopProof: jest.fn<any>().mockResolvedValue('mock-proof'),
        loginWithCustomTokenExchange: jest.fn<any>().mockResolvedValue({}),
        createFetcher: jest.fn<any>().mockReturnValue({}),
        mfa: {
          setMFAAuthDetails: jest.fn(),
          getAuthenticators: jest.fn<any>().mockResolvedValue([]),
          enroll: jest.fn<any>().mockResolvedValue({}),
          challenge: jest.fn<any>().mockResolvedValue({}),
          verify: jest.fn<any>().mockResolvedValue({}),
          getEnrollmentFactors: jest.fn<any>().mockResolvedValue([])
        },
        passkey: {
          signup: passkeySignupMock,
          login: passkeyLoginMock,
          continueSignup: passkeyContinueSignupMock,
          getSignupChallenge: passkeyGetSignupChallengeMock,
          getLoginChallenge: passkeyGetLoginChallengeMock,
          getTokenWithPasskey: passkeyGetTokenWithPasskeyMock
        },
        myAccount: {
          getFactors: jest.fn<any>().mockResolvedValue([]),
          getAuthenticationMethods: jest.fn<any>().mockResolvedValue([]),
          getAuthenticationMethod: jest.fn<any>().mockResolvedValue({ id: 'test-id' }),
          updateAuthenticationMethod: jest.fn<any>().mockResolvedValue({ id: 'test-id' }),
          deleteAuthenticationMethod: jest.fn<any>().mockResolvedValue(undefined),
          enrollmentChallenge: jest.fn<any>().mockResolvedValue({ id: 'test-challenge-id', auth_session: 'test-session' }),
          enrollmentVerify: jest.fn<any>().mockResolvedValue({ id: 'test-method-id' })
        }
      };
    }),
    PasskeyError: class PasskeyError extends Error {
      constructor(public code: string, message: string) {
        super(message);
        this.name = 'PasskeyError';
      }
    },
    GenericError: class GenericError extends Error {
      constructor(
        public error: string,
        public error_description: string,
        public data?: Record<string, any>
      ) {
        super(error_description);
      }
    },
    PasskeyRegisterError: class PasskeyRegisterError extends Error {},
    PasskeyChallengeError: class PasskeyChallengeError extends Error {},
    // Mirrors auth0-auth-js: retryable only for invalid_grant with auth_session
    PasskeyGetTokenError: class PasskeyGetTokenError extends Error {
      public isRetryable: boolean;
      public authSession?: string;
      public verificationRequired?: Array<'email' | 'phone'>;
      constructor(message: string, public cause?: any) {
        super(message);
        this.name = 'PasskeyGetTokenError';
        this.isRetryable =
          cause?.error === 'invalid_grant' && cause?.auth_session != null;
        this.authSession = cause?.auth_session;
        this.verificationRequired = cause?.verification_required;
      }
    },
    PasskeyVerificationRequiredError: class PasskeyVerificationRequiredError extends Error {
      public error = 'verification_required';
      constructor(public verificationRequired: Array<'email' | 'phone'>) {
        super('Identifier verification is required before passkey creation.');
        this.name = 'PasskeyVerificationRequiredError';
      }
    },
    MfaRequiredError: class MfaRequiredError extends Error {
      constructor(
        public error: string,
        public error_description: string,
        public mfa_token: string,
        public mfa_requirements: any
      ) {
        super(error_description);
        this.name = 'MfaRequiredError';
      }
    }
  };
});

// Not re-exported by auth0-vue, so take it from the mocked module
const { GenericError } = jest.requireMock<any>('@auth0/auth0-spa-js');

describe('Passkey API', () => {
  const savedLocation = window.location;
  const savedHistory = window.history;
  let appMock: App<any>;

  beforeEach(() => {
    isAuthenticatedMock.mockResolvedValue(false);
    getUserMock.mockResolvedValue(null);

    delete (window as any).location;
    window.location = Object.assign(new URL('https://example.org'), {
      ancestorOrigins: '',
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn()
    }) as any;

    delete (window as any).history;
    window.history = {
      replaceState: jest.fn()
    } as any;

    appMock = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any;
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: savedLocation,
      writable: true,
      configurable: true
    });
    window.history = savedHistory;
  });

  describe('Basic Availability', () => {
    it('should expose passkey client after plugin install', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(plugin.passkey).toBeDefined();
      expect(plugin.passkey.signup).toBeDefined();
      expect(plugin.passkey.login).toBeDefined();
      expect(plugin.passkey.continueSignup).toBeDefined();
      expect(plugin.passkey.getSignupChallenge).toBeDefined();
      expect(plugin.passkey.getLoginChallenge).toBeDefined();
      expect(plugin.passkey.getTokenWithPasskey).toBeDefined();
    });

    it('should wrap every method of the spa-js PasskeyApiClient', async () => {
      const { PasskeyApiClient } = jest.requireActual<any>('@auth0/auth0-spa-js');
      const methods = Object.getOwnPropertyNames(PasskeyApiClient.prototype)
        .filter(name => name !== 'constructor');

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      expect(methods.length).toBeGreaterThan(0);
      methods.forEach(name => {
        expect(typeof (plugin.passkey as any)[name]).toBe('function');
      });
    });
  });

  describe('passkey.signup', () => {
    it('should return token response', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const tokenResponse = await plugin.passkey.signup({ email: 'user@example.com' });

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse.access_token).toBe('passkey-token');
      expect(tokenResponse.id_token).toBe('passkey-id-token');
    });

    it('should forward options to underlying passkey client', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await plugin.passkey.signup({ email: 'user@example.com', realm: 'Username-Password-Authentication' });

      expect(passkeySignupMock).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com', realm: 'Username-Password-Authentication' })
      );
    });

    it('should rethrow errors from passkey.signup', async () => {
      passkeySignupMock.mockRejectedValueOnce(new Error('WebAuthn not supported'));

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await expect(
        plugin.passkey.signup({ email: 'user@example.com' })
      ).rejects.toThrow('WebAuthn not supported');
    });

    it('should update isAuthenticated and user after passkey.signup', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      isAuthenticatedMock.mockResolvedValue(true);
      getUserMock.mockResolvedValue({ name: '__test_user__' });

      await plugin.passkey.signup({ email: 'user@example.com' });

      expect(plugin.isAuthenticated.value).toEqual(true);
      expect(plugin.user.value).toEqual({ name: '__test_user__' });
    });
  });

  describe('passkey.login', () => {
    it('should return token response', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const tokenResponse = await plugin.passkey.login();

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse.access_token).toBe('passkey-token');
    });

    it('should forward options to underlying passkey client', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await plugin.passkey.login({ realm: 'Username-Password-Authentication', scope: 'openid profile email' });

      expect(passkeyLoginMock).toHaveBeenCalledWith(
        expect.objectContaining({ realm: 'Username-Password-Authentication', scope: 'openid profile email' })
      );
    });

    it('should rethrow errors from passkey.login', async () => {
      passkeyLoginMock.mockRejectedValueOnce(new Error('User cancelled'));

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await expect(plugin.passkey.login()).rejects.toThrow('User cancelled');
    });

    it('should update isAuthenticated and user after passkey.login', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      isAuthenticatedMock.mockResolvedValue(true);
      getUserMock.mockResolvedValue({ name: '__test_user__' });

      await plugin.passkey.login();

      expect(plugin.isAuthenticated.value).toEqual(true);
      expect(plugin.user.value).toEqual({ name: '__test_user__' });
    });
  });

  describe('identifier verification with passkey.signup', () => {
    it('should forward deliveryMethod to the underlying passkey client', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.signup({
        phoneNumber: '+14155550100',
        deliveryMethod: 'voice'
      });

      expect(passkeySignupMock).toHaveBeenCalledWith(
        expect.objectContaining({ phoneNumber: '+14155550100', deliveryMethod: 'voice' })
      );
    });

    it('should rethrow PasskeyVerificationRequiredError with verificationRequired', async () => {
      passkeySignupMock.mockRejectedValueOnce(
        new PasskeyVerificationRequiredError(['email'])
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .signup({ email: 'user@example.com' })
        .catch(e => e);

      expect(error).toBeInstanceOf(PasskeyVerificationRequiredError);
      expect(error.verificationRequired).toEqual(['email']);
    });

    it('should rethrow PasskeyVerificationRequiredError for several identifiers', async () => {
      passkeySignupMock.mockRejectedValueOnce(
        new PasskeyVerificationRequiredError(['email', 'phone'])
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .signup({ email: 'user@example.com', phoneNumber: '+14155550100' })
        .catch(e => e);

      expect(error.verificationRequired).toEqual(['email', 'phone']);
    });

    it('should capture PasskeyVerificationRequiredError in the error ref and stay unauthenticated', async () => {
      const verificationError = new PasskeyVerificationRequiredError(['email']);
      passkeySignupMock.mockRejectedValueOnce(verificationError);

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await expect(
        plugin.passkey.signup({ email: 'user@example.com' })
      ).rejects.toBe(verificationError);

      expect(plugin.error.value).toBe(verificationError);
      expect(plugin.isAuthenticated.value).toBe(false);
    });
  });

  describe('passkey.continueSignup', () => {
    it('should forward the verification codes and return the token response', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const tokenResponse = await plugin.passkey.continueSignup({ email: '123456' });

      expect(passkeyContinueSignupMock).toHaveBeenCalledWith({ email: '123456' });
      expect(tokenResponse.access_token).toBe('passkey-token');
    });

    it('should forward codes for several identifiers', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.continueSignup({ email: '123456', phone: '654321' });

      expect(passkeyContinueSignupMock).toHaveBeenCalledWith({
        email: '123456',
        phone: '654321'
      });
    });

    it('should update isAuthenticated and user after passkey.continueSignup', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      isAuthenticatedMock.mockResolvedValue(true);
      getUserMock.mockResolvedValue({ name: '__test_user__' });

      await plugin.passkey.continueSignup({ email: '123456' });

      expect(plugin.isAuthenticated.value).toEqual(true);
      expect(plugin.user.value).toEqual({ name: '__test_user__' });
    });

    it('should clear the error ref after signup and continueSignup succeed', async () => {
      passkeySignupMock.mockRejectedValueOnce(
        new PasskeyVerificationRequiredError(['email'])
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.signup({ email: 'user@example.com' }).catch(() => undefined);
      expect(plugin.error.value).toBeInstanceOf(PasskeyVerificationRequiredError);

      await plugin.passkey.continueSignup({ email: '123456' });
      expect(plugin.error.value).toBeNull();
    });

    it('should rethrow a retryable PasskeyGetTokenError for a wrong code', async () => {
      passkeyContinueSignupMock.mockRejectedValueOnce(
        new PasskeyGetTokenError('Invalid or expired session', {
          error: 'invalid_grant',
          error_description: 'Invalid or expired session',
          auth_session: 'auth-session-a',
          verification_required: ['email']
        })
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .continueSignup({ email: '000000' })
        .catch(e => e);

      expect(error).toBeInstanceOf(PasskeyGetTokenError);
      expect(error.isRetryable).toBe(true);
      expect(error.authSession).toBe('auth-session-a');
      expect(error.verificationRequired).toEqual(['email']);
      expect(plugin.error.value).toBe(error);
      expect(plugin.isAuthenticated.value).toBe(false);
    });

    it('should list every identifier that still needs a code after a wrong code', async () => {
      passkeyContinueSignupMock.mockRejectedValueOnce(
        new PasskeyGetTokenError('Invalid or expired session', {
          error: 'invalid_grant',
          error_description: 'Invalid or expired session',
          auth_session: 'auth-session-a',
          verification_required: ['email', 'phone']
        })
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .continueSignup({ email: '000000', phone: '000000' })
        .catch(e => e);

      expect(error.isRetryable).toBe(true);
      expect(error.verificationRequired).toEqual(['email', 'phone']);
    });

    it('should succeed on a retry after a wrong code', async () => {
      passkeyContinueSignupMock.mockRejectedValueOnce(
        new PasskeyGetTokenError('Invalid or expired session', {
          error: 'invalid_grant',
          error_description: 'Invalid or expired session',
          auth_session: 'auth-session-a',
          verification_required: ['email']
        })
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.continueSignup({ email: '000000' }).catch(() => undefined);

      isAuthenticatedMock.mockResolvedValue(true);
      const tokenResponse = await plugin.passkey.continueSignup({ email: '123456' });

      expect(passkeyContinueSignupMock).toHaveBeenNthCalledWith(1, { email: '000000' });
      expect(passkeyContinueSignupMock).toHaveBeenNthCalledWith(2, { email: '123456' });
      expect(tokenResponse.access_token).toBe('passkey-token');
      expect(plugin.isAuthenticated.value).toBe(true);
      expect(plugin.error.value).toBeNull();
    });

    it('should rethrow a terminal error that has no auth_session unchanged', async () => {
      const terminalError = new GenericError(
        'invalid_grant',
        'Invalid or expired session',
        {}
      );
      passkeyContinueSignupMock.mockRejectedValueOnce(terminalError);

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .continueSignup({ email: '123456' })
        .catch(e => e);

      expect(error).toBe(terminalError);
      expect(error).not.toBeInstanceOf(PasskeyGetTokenError);
      expect(error.error).toBe('invalid_grant');
      expect(plugin.error.value).toBe(terminalError);
    });

    it('should rethrow PasskeyError when there is no pending signup', async () => {
      passkeyContinueSignupMock.mockRejectedValueOnce(
        new PasskeyError('no_pending_signup', 'No pending signup found.')
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .continueSignup({ email: '123456' })
        .catch(e => e);

      expect(error).toBeInstanceOf(PasskeyError);
      expect(error.code).toBe('no_pending_signup');
    });

    it('should rethrow PasskeyError when a code is missing', async () => {
      passkeyContinueSignupMock.mockRejectedValueOnce(
        new PasskeyError('missing_verification_code', 'Missing OTP code for: phone.')
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .continueSignup({ email: '123456' })
        .catch(e => e);

      expect(error).toBeInstanceOf(PasskeyError);
      expect(error.code).toBe('missing_verification_code');
    });

    it('should rethrow MfaRequiredError with the mfa_token', async () => {
      passkeyContinueSignupMock.mockRejectedValueOnce(
        new MfaRequiredError(
          'mfa_required',
          'Multifactor authentication required',
          'mfa-token-123',
          { challenge: [{ type: 'otp' }] }
        )
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .continueSignup({ email: '123456' })
        .catch(e => e);

      expect(error).toBeInstanceOf(MfaRequiredError);
      expect(error.mfa_token).toBe('mfa-token-123');
    });
  });

  describe('passkey.getSignupChallenge', () => {
    it('should return a challenge without verificationRequired when none is needed', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const challenge = await plugin.passkey.getSignupChallenge({ email: 'user@example.com' });

      expect(challenge.authSession).toBe('auth-session-a');
      expect(challenge.verificationRequired).toBeUndefined();
    });

    it('should return verificationRequired when verification is needed', async () => {
      passkeyGetSignupChallengeMock.mockResolvedValueOnce({
        authSession: 'auth-session-a',
        publicKey: {},
        verificationRequired: ['email']
      });

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const challenge = await plugin.passkey.getSignupChallenge({ email: 'user@example.com' });

      expect(challenge.verificationRequired).toEqual(['email']);
    });

    it('should return several identifiers in verificationRequired', async () => {
      passkeyGetSignupChallengeMock.mockResolvedValueOnce({
        authSession: 'auth-session-a',
        publicKey: {},
        verificationRequired: ['email', 'phone']
      });

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const challenge = await plugin.passkey.getSignupChallenge({
        email: 'user@example.com',
        phoneNumber: '+14155550100'
      });

      expect(challenge.verificationRequired).toEqual(['email', 'phone']);
    });

    it('should forward options, including deliveryMethod', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.getSignupChallenge({
        phoneNumber: '+14155550100',
        realm: 'Username-Password-Authentication',
        deliveryMethod: 'text'
      });

      expect(passkeyGetSignupChallengeMock).toHaveBeenCalledWith({
        phoneNumber: '+14155550100',
        realm: 'Username-Password-Authentication',
        deliveryMethod: 'text'
      });
    });

    it('should not refresh the auth state', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);
      await new Promise(resolve => setTimeout(resolve, 0));
      isAuthenticatedMock.mockClear();

      await plugin.passkey.getSignupChallenge({ email: 'user@example.com' });

      expect(isAuthenticatedMock).not.toHaveBeenCalled();
    });

    it('should rethrow errors and capture them in the error ref', async () => {
      const challengeError = new Error('Too Many Requests');
      passkeyGetSignupChallengeMock.mockRejectedValueOnce(challengeError);

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await expect(
        plugin.passkey.getSignupChallenge({ email: 'user@example.com' })
      ).rejects.toBe(challengeError);
      expect(plugin.error.value).toBe(challengeError);
    });
  });

  describe('passkey.getLoginChallenge', () => {
    it('should forward options and return the challenge', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const challenge = await plugin.passkey.getLoginChallenge({
        realm: 'Username-Password-Authentication'
      });

      expect(passkeyGetLoginChallengeMock).toHaveBeenCalledWith({
        realm: 'Username-Password-Authentication'
      });
      expect(challenge.authSession).toBe('auth-session-b');
    });

    it('should work without options', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.getLoginChallenge();

      expect(passkeyGetLoginChallengeMock).toHaveBeenCalledWith(undefined);
    });
  });

  describe('passkey.getTokenWithPasskey', () => {
    const credential = { id: 'credential-id' } as unknown as PublicKeyCredential;

    it('should forward the verification codes', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const tokenResponse = await plugin.passkey.getTokenWithPasskey({
        authSession: 'auth-session-a',
        credential,
        verification: { email: '123456', phone: '654321' }
      });

      expect(passkeyGetTokenWithPasskeyMock).toHaveBeenCalledWith({
        authSession: 'auth-session-a',
        credential,
        verification: { email: '123456', phone: '654321' }
      });
      expect(tokenResponse.access_token).toBe('passkey-token');
    });

    it('should not add a verification key when none is passed', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await plugin.passkey.getTokenWithPasskey({
        authSession: 'auth-session-a',
        credential
      });

      const calls = passkeyGetTokenWithPasskeyMock.mock.calls;
      const [options] = calls[calls.length - 1] as any[];
      expect(options).not.toHaveProperty('verification');
    });

    it('should update isAuthenticated and user after passkey.getTokenWithPasskey', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      isAuthenticatedMock.mockResolvedValue(true);
      getUserMock.mockResolvedValue({ name: '__test_user__' });

      await plugin.passkey.getTokenWithPasskey({ authSession: 'auth-session-a', credential });

      expect(plugin.isAuthenticated.value).toEqual(true);
      expect(plugin.user.value).toEqual({ name: '__test_user__' });
    });

    it('should rethrow a retryable PasskeyGetTokenError with the auth session to retry with', async () => {
      passkeyGetTokenWithPasskeyMock.mockRejectedValueOnce(
        new PasskeyGetTokenError('Invalid or expired session', {
          error: 'invalid_grant',
          error_description: 'Invalid or expired session',
          auth_session: 'auth-session-a',
          verification_required: ['phone']
        })
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .getTokenWithPasskey({
          authSession: 'auth-session-a',
          credential,
          verification: { email: '123456', phone: '000000' }
        })
        .catch(e => e);

      expect(error.isRetryable).toBe(true);
      expect(error.authSession).toBe('auth-session-a');
      expect(error.verificationRequired).toEqual(['phone']);
    });

    it('should succeed on a retry with the auth session from the error', async () => {
      passkeyGetTokenWithPasskeyMock.mockRejectedValueOnce(
        new PasskeyGetTokenError('Invalid or expired session', {
          error: 'invalid_grant',
          error_description: 'Invalid or expired session',
          auth_session: 'auth-session-a',
          verification_required: ['email']
        })
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .getTokenWithPasskey({ authSession: 'auth-session-a', credential, verification: { email: '000000' } })
        .catch(e => e);

      const tokenResponse = await plugin.passkey.getTokenWithPasskey({
        authSession: error.authSession,
        credential,
        verification: { email: '123456' }
      });

      expect(passkeyGetTokenWithPasskeyMock).toHaveBeenLastCalledWith({
        authSession: 'auth-session-a',
        credential,
        verification: { email: '123456' }
      });
      expect(tokenResponse.access_token).toBe('passkey-token');
    });

    it('should rethrow other token errors unchanged', async () => {
      const requestError = new GenericError(
        'invalid_request',
        'Missing required parameter: verification.email',
        {}
      );
      passkeyGetTokenWithPasskeyMock.mockRejectedValueOnce(requestError);

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .getTokenWithPasskey({ authSession: 'auth-session-a', credential })
        .catch(e => e);

      expect(error).toBe(requestError);
      expect(error).not.toBeInstanceOf(PasskeyGetTokenError);
      expect(error.error).toBe('invalid_request');
    });

    it('should rethrow PasskeyError for an empty code', async () => {
      passkeyGetTokenWithPasskeyMock.mockRejectedValueOnce(
        new PasskeyError('missing_verification_code', 'OTP codes in verification must not be empty.')
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .getTokenWithPasskey({ authSession: 'auth-session-a', credential, verification: { email: '' } })
        .catch(e => e);

      expect(error).toBeInstanceOf(PasskeyError);
      expect(error.code).toBe('missing_verification_code');
    });

    it('should rethrow MfaRequiredError with the mfa_token', async () => {
      passkeyGetTokenWithPasskeyMock.mockRejectedValueOnce(
        new MfaRequiredError(
          'mfa_required',
          'Multifactor authentication required',
          'mfa-token-456',
          { challenge: [{ type: 'otp' }] }
        )
      );

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      const error = await plugin.passkey
        .getTokenWithPasskey({ authSession: 'auth-session-a', credential, verification: { email: '123456' } })
        .catch(e => e);

      expect(error).toBeInstanceOf(MfaRequiredError);
      expect(error.mfa_token).toBe('mfa-token-456');
    });
  });
});
