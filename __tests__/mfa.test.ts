import { App } from 'vue';
import { createAuth0, useAuth0 } from '../src/index';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals';
import { inject } from 'vue';

const mfaGetAuthenticatorsMock = jest.fn<any>().mockResolvedValue([]);
const mfaEnrollMock = jest.fn<any>().mockResolvedValue({});
const mfaChallengeMock = jest.fn<any>().mockResolvedValue({});
const mfaVerifyMock = jest.fn<any>().mockResolvedValue({});
const mfaGetEnrollmentFactorsMock = jest.fn<any>().mockResolvedValue([]);
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
        createFetcher: jest.fn<any>().mockReturnValue({}),
        mfa: {
          setMFAAuthDetails: jest.fn(),
          getAuthenticators: mfaGetAuthenticatorsMock,
          enroll: mfaEnrollMock,
          challenge: mfaChallengeMock,
          verify: mfaVerifyMock,
          getEnrollmentFactors: mfaGetEnrollmentFactorsMock
        }
      };
    }),
    MfaRequiredError: class MfaRequiredError extends Error {
      mfa_token: string;
      constructor(
        error: string,
        error_description: string,
        mfa_token: string
      ) {
        super(error_description);
        this.name = 'MfaRequiredError';
        this.mfa_token = mfa_token;
      }
    },
    MfaError: class MfaError extends Error {},
    MfaListAuthenticatorsError: class MfaListAuthenticatorsError extends Error {},
    MfaEnrollmentError: class MfaEnrollmentError extends Error {},
    MfaChallengeError: class MfaChallengeError extends Error {},
    MfaVerifyError: class MfaVerifyError extends Error {},
    MfaEnrollmentFactorsError: class MfaEnrollmentFactorsError extends Error {}
  };
});

describe('MFA', () => {
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

    isAuthenticatedMock.mockResolvedValue(false);
    getUserMock.mockResolvedValue(null);
    getIdTokenClaimsMock.mockResolvedValue(null);

    appMock = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: savedLocation,
      writable: true,
      configurable: true
    });
    window.history = savedHistory;
  });

  describe('useAuth0 mfa property', () => {
    it('should expose the mfa client via useAuth0', () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      (inject as jest.Mock).mockReturnValue(plugin);
      const auth0 = useAuth0();

      expect(auth0.mfa).toBeDefined();
    });

    it('should call mfa methods through the useAuth0 composition API', async () => {
      const plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);

      (inject as jest.Mock).mockReturnValue(plugin);
      const auth0 = useAuth0();

      mfaGetAuthenticatorsMock.mockResolvedValue([
        { id: 'otp|dev_1', authenticatorType: 'otp', active: true }
      ]);

      const result = await auth0.mfa.getAuthenticators('test-mfa-token');

      expect(mfaGetAuthenticatorsMock).toHaveBeenCalledWith('test-mfa-token');
      expect(result).toEqual([
        { id: 'otp|dev_1', authenticatorType: 'otp', active: true }
      ]);
    });
  });

  describe('mfa methods', () => {
    let plugin: ReturnType<typeof createAuth0>;

    beforeEach(() => {
      plugin = createAuth0({ domain: '', clientId: '' });
      plugin.install(appMock);
    });

    it('should call getAuthenticators on the underlying spa-js mfa client', async () => {
      const mfaToken = 'test-mfa-token';
      mfaGetAuthenticatorsMock.mockResolvedValue([
        { id: 'otp|dev_1', authenticatorType: 'otp', active: true }
      ]);

      const result = await plugin.mfa.getAuthenticators(mfaToken);

      expect(mfaGetAuthenticatorsMock).toHaveBeenCalledWith(mfaToken);
      expect(result).toEqual([
        { id: 'otp|dev_1', authenticatorType: 'otp', active: true }
      ]);
    });

    it('should bubble errors from getAuthenticators to the caller', async () => {
      const errorObj = new Error('getAuthenticators failed');
      mfaGetAuthenticatorsMock.mockRejectedValue(errorObj);

      await expect(plugin.mfa.getAuthenticators('test-mfa-token')).rejects.toBe(errorObj);
    });

    it('should call enroll on the underlying spa-js mfa client', async () => {
      const enrollParams = { mfaToken: 'test-mfa-token', factorType: 'otp' as const };
      const enrollResponse = {
        authenticatorType: 'otp',
        secret: 'BASE32SECRET',
        barcodeUri: 'otpauth://totp/...'
      };
      mfaEnrollMock.mockResolvedValue(enrollResponse);

      const result = await plugin.mfa.enroll(enrollParams);

      expect(mfaEnrollMock).toHaveBeenCalledWith(enrollParams);
      expect(result).toEqual(enrollResponse);
    });

    it('should bubble errors from enroll to the caller', async () => {
      const errorObj = new Error('enroll failed');
      mfaEnrollMock.mockRejectedValue(errorObj);

      await expect(
        plugin.mfa.enroll({ mfaToken: 'test-mfa-token', factorType: 'otp' })
      ).rejects.toBe(errorObj);
    });

    it('should call challenge on the underlying spa-js mfa client', async () => {
      const challengeParams = {
        mfaToken: 'test-mfa-token',
        challengeType: 'otp' as const,
        authenticatorId: 'otp|dev_1'
      };
      const challengeResponse = { challengeType: 'otp' as const };
      mfaChallengeMock.mockResolvedValue(challengeResponse);

      const result = await plugin.mfa.challenge(challengeParams);

      expect(mfaChallengeMock).toHaveBeenCalledWith(challengeParams);
      expect(result).toEqual(challengeResponse);
    });

    it('should bubble errors from challenge to the caller', async () => {
      const errorObj = new Error('challenge failed');
      mfaChallengeMock.mockRejectedValue(errorObj);

      await expect(
        plugin.mfa.challenge({ mfaToken: 'test-mfa-token', challengeType: 'otp', authenticatorId: 'otp|dev_1' })
      ).rejects.toBe(errorObj);
    });

    it('should call verify on the underlying spa-js mfa client', async () => {
      const verifyParams = { mfaToken: 'test-mfa-token', otp: '123456' };
      const tokenResponse = { access_token: 'new-access-token' };
      mfaVerifyMock.mockResolvedValue(tokenResponse);

      const result = await plugin.mfa.verify(verifyParams);

      expect(mfaVerifyMock).toHaveBeenCalledWith(verifyParams);
      expect(result).toEqual(tokenResponse);
    });

    it('should bubble errors from verify to the caller', async () => {
      const errorObj = new Error('verify failed');
      mfaVerifyMock.mockRejectedValue(errorObj);

      await expect(
        plugin.mfa.verify({ mfaToken: 'test-mfa-token', otp: '123456' })
      ).rejects.toBe(errorObj);
    });

    it('should call getEnrollmentFactors on the underlying spa-js mfa client', async () => {
      const mfaToken = 'test-mfa-token';
      mfaGetEnrollmentFactorsMock.mockResolvedValue([{ type: 'otp' }, { type: 'phone' }]);

      const result = await plugin.mfa.getEnrollmentFactors(mfaToken);

      expect(mfaGetEnrollmentFactorsMock).toHaveBeenCalledWith(mfaToken);
      expect(result).toEqual([{ type: 'otp' }, { type: 'phone' }]);
    });

    it('should bubble errors from getEnrollmentFactors to the caller', async () => {
      const errorObj = new Error('getEnrollmentFactors failed');
      mfaGetEnrollmentFactorsMock.mockRejectedValue(errorObj);

      await expect(plugin.mfa.getEnrollmentFactors('test-mfa-token')).rejects.toBe(errorObj);
    });
  });
});
