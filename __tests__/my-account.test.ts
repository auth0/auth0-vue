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

const myAccountGetFactorsMock = jest.fn<any>().mockResolvedValue([{ status: 'enabled', type: 'passkey' }]);
const myAccountGetAuthenticationMethodsMock = jest.fn<any>().mockResolvedValue([{ id: 'method-1', type: 'passkey' }]);
const myAccountGetAuthenticationMethodMock = jest.fn<any>().mockResolvedValue({ id: 'test-method-id', type: 'passkey' });
const myAccountUpdateAuthenticationMethodMock = jest.fn<any>().mockResolvedValue({ id: 'test-method-id', name: 'My Passkey' });
const myAccountDeleteAuthenticationMethodMock = jest.fn<any>().mockResolvedValue(undefined);
const myAccountEnrollmentChallengeMock = jest.fn<any>().mockResolvedValue({
  id: 'test-challenge-id',
  auth_session: 'test-auth-session',
  location: 'https://example.auth0.com/me/v1/authentication-methods/test-challenge-id'
});
const myAccountEnrollmentVerifyMock = jest.fn<any>().mockResolvedValue({ id: 'test-method-id', type: 'passkey' });

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
          signup: jest.fn<any>().mockResolvedValue({ access_token: 'passkey-token' }),
          login: jest.fn<any>().mockResolvedValue({ access_token: 'passkey-token' })
        },
        myAccount: {
          getFactors: myAccountGetFactorsMock,
          getAuthenticationMethods: myAccountGetAuthenticationMethodsMock,
          getAuthenticationMethod: myAccountGetAuthenticationMethodMock,
          updateAuthenticationMethod: myAccountUpdateAuthenticationMethodMock,
          deleteAuthenticationMethod: myAccountDeleteAuthenticationMethodMock,
          enrollmentChallenge: myAccountEnrollmentChallengeMock,
          enrollmentVerify: myAccountEnrollmentVerifyMock
        }
      };
    }),
    MyAccountApiError: class MyAccountApiError extends Error {
      public type: string;
      public status: number;
      public title: string;
      public detail: string;
      constructor({ type, status, title, detail }: any) {
        super(detail);
        this.name = 'MyAccountApiError';
        this.type = type;
        this.status = status;
        this.title = title;
        this.detail = detail;
      }
    }
  };
});

describe('MyAccount API', () => {
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
    it('should expose myAccount client after plugin install', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(plugin.myAccount).toBeDefined();
      expect(plugin.myAccount.getFactors).toBeDefined();
      expect(plugin.myAccount.getAuthenticationMethods).toBeDefined();
      expect(plugin.myAccount.getAuthenticationMethod).toBeDefined();
      expect(plugin.myAccount.updateAuthenticationMethod).toBeDefined();
      expect(plugin.myAccount.deleteAuthenticationMethod).toBeDefined();
      expect(plugin.myAccount.enrollmentChallenge).toBeDefined();
      expect(plugin.myAccount.enrollmentVerify).toBeDefined();
    });
  });

  describe('getFactors', () => {
    it('should return list of factors', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const factors = await plugin.myAccount.getFactors();

      expect(Array.isArray(factors)).toBe(true);
      expect(myAccountGetFactorsMock).toHaveBeenCalled();
    });
  });

  describe('getAuthenticationMethods', () => {
    it('should return list of authentication methods without filter', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const methods = await plugin.myAccount.getAuthenticationMethods();

      expect(Array.isArray(methods)).toBe(true);
      expect(myAccountGetAuthenticationMethodsMock).toHaveBeenCalled();
    });

    it('should forward type filter to underlying client', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await plugin.myAccount.getAuthenticationMethods('passkey');

      expect(myAccountGetAuthenticationMethodsMock).toHaveBeenCalledWith('passkey');
    });
  });

  describe('getAuthenticationMethod', () => {
    it('should return a single authentication method by id', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const method = await plugin.myAccount.getAuthenticationMethod('test-method-id');

      expect(method).toBeDefined();
      expect((method as any).id).toBe('test-method-id');
      expect(myAccountGetAuthenticationMethodMock).toHaveBeenCalledWith('test-method-id');
    });
  });

  describe('updateAuthenticationMethod', () => {
    it('should update and return the authentication method', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const updated = await plugin.myAccount.updateAuthenticationMethod('test-method-id', { name: 'My Passkey' });

      expect((updated as any).id).toBe('test-method-id');
      expect(myAccountUpdateAuthenticationMethodMock).toHaveBeenCalledWith('test-method-id', { name: 'My Passkey' });
    });
  });

  describe('deleteAuthenticationMethod', () => {
    it('should delete authentication method without returning a value', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await expect(
        plugin.myAccount.deleteAuthenticationMethod('test-method-id')
      ).resolves.toBeUndefined();
      expect(myAccountDeleteAuthenticationMethodMock).toHaveBeenCalledWith('test-method-id');
    });
  });

  describe('enrollmentChallenge', () => {
    it('should return enrollment challenge response', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const challenge = await plugin.myAccount.enrollmentChallenge({ type: 'totp' });

      expect((challenge as any).id).toBe('test-challenge-id');
      expect((challenge as any).auth_session).toBe('test-auth-session');
      expect(myAccountEnrollmentChallengeMock).toHaveBeenCalledWith({ type: 'totp' });
    });
  });

  describe('enrollmentVerify', () => {
    it('should verify enrollment and return authentication method', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      const result = await plugin.myAccount.enrollmentVerify({
        type: 'totp',
        location: 'https://example.auth0.com/me/v1/authentication-methods/test-challenge-id',
        auth_session: 'test-auth-session',
        otp_code: '123456'
      } as any);

      expect((result as any).id).toBe('test-method-id');
      expect(myAccountEnrollmentVerifyMock).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors thrown by myAccount methods', async () => {
      const { MyAccountApiError } = await import('@auth0/auth0-spa-js') as any;
      const error = new MyAccountApiError({
        type: 'https://auth0.com/docs/errors#insufficient-scope',
        status: 403,
        title: 'Forbidden',
        detail: 'Insufficient scope'
      });
      myAccountGetAuthenticationMethodsMock.mockRejectedValueOnce(error);

      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      await new Promise(resolve => setTimeout(resolve, 0));

      await expect(
        plugin.myAccount.getAuthenticationMethods()
      ).rejects.toBeInstanceOf(MyAccountApiError);
    });
  });
});
