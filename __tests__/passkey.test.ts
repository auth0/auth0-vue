import { App } from 'vue';
import { createAuth0 } from '../src/index';
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
          login: passkeyLoginMock
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
    PasskeyRegisterError: class PasskeyRegisterError extends Error {},
    PasskeyChallengeError: class PasskeyChallengeError extends Error {},
    PasskeyGetTokenError: class PasskeyGetTokenError extends Error {}
  };
});

describe('Passkey API', () => {
  const savedLocation = window.location;
  const savedHistory = window.history;
  let appMock: App<any>;

  beforeEach(() => {
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
});
