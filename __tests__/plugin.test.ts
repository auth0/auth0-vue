import { Auth0Client } from '@auth0/auth0-spa-js';
import { App, inject } from 'vue';
import { Router } from 'vue-router';
import { AUTH0_INJECTION_KEY, createAuth0, useAuth0 } from '../src/index';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals';
import { client } from '../src/plugin';

const loginWithRedirectMock = jest.fn<any>().mockResolvedValue(null);
const loginWithPopupMock = jest.fn<any>().mockResolvedValue(null);
const logoutMock = jest.fn<any>();
const checkSessionMock = jest.fn<any>().mockResolvedValue(null);
const handleRedirectCallbackMock = jest.fn<any>().mockResolvedValue(null);
const isAuthenticatedMock = jest.fn<any>().mockResolvedValue(false);
const getUserMock = jest.fn<any>().mockResolvedValue(null);
const getIdTokenClaimsMock = jest.fn<any>().mockResolvedValue(null);
const buildAuthorizeUrlMock = jest.fn<any>().mockResolvedValue(null);
const buildLogoutUrlMock = jest.fn<any>().mockResolvedValue(null);
const getTokenSilentlyMock = jest.fn<any>().mockResolvedValue(null);
const getTokenWithPopupMock = jest.fn<any>().mockResolvedValue(null);

const getDpopNonceMock = jest.fn<any>().mockResolvedValue(undefined);
const setDpopNonceMock = jest.fn<any>().mockResolvedValue(undefined);
const generateDpopProofMock = jest.fn<any>().mockResolvedValue('mock-proof');
const createFetcherMock = jest.fn<any>().mockReturnValue({
  fetchWithAuth: jest.fn<any>().mockResolvedValue({ status: 200, data: 'test' })
});

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
        loginWithRedirect: loginWithRedirectMock,
        loginWithPopup: loginWithPopupMock,
        logout: logoutMock,
        isAuthenticated: isAuthenticatedMock,
        getUser: getUserMock,
        getIdTokenClaims: getIdTokenClaimsMock,
        buildAuthorizeUrl: buildAuthorizeUrlMock,
        buildLogoutUrl: buildLogoutUrlMock,
        getTokenSilently: getTokenSilentlyMock,
        getTokenWithPopup: getTokenWithPopupMock,
        getDpopNonce: getDpopNonceMock,
        setDpopNonce: setDpopNonceMock,
        generateDpopProof: generateDpopProofMock,
        createFetcher: createFetcherMock
      };
    })
  };
});

describe('Client', () => {
  it('logs console error when used before installing the plugin', async () => {
    const spy = jest.spyOn(console, 'error');

    await client.value.loginWithRedirect();

    expect(spy).toHaveBeenCalledWith(
      `Please ensure Auth0's Vue plugin is correctly installed.`
    );
  });
});

describe('createAuth0', () => {
  it('should create a plugin', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });
    expect(plugin.install).toBeTruthy();
  });
});

describe('useAuth0', () => {
  it('should call inject', async () => {
    const instance = {};
    (inject as jest.Mock).mockReturnValue(instance);
    const result = useAuth0();
    expect(result).toBe(instance);
  });
});

describe('Auth0Plugin', () => {
  const savedLocation = window.location;
  const savedHistory = window.history;
  let replaceStateMock = jest.fn();
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
      replaceState: replaceStateMock
    } as any;

    isAuthenticatedMock.mockResolvedValue(false);
    getUserMock.mockResolvedValue(null);
    getIdTokenClaimsMock.mockResolvedValue(null);
    loginWithRedirectMock.mockResolvedValue(null);
    loginWithPopupMock.mockResolvedValue(null);
    checkSessionMock.mockResolvedValue(null);

    appMock = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    jest.restoreAllMocks();
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: savedLocation,
      writable: true,
      configurable: true
    });
    window.history = savedHistory;
  });

  it('should create a proxy on installation', async () => {
    const plugin = createAuth0({
      domain: 'domain 123',
      clientId: 'client id 123',
      authorizationParams: {
        foo: 'bar'
      }
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalledWith(
      AUTH0_INJECTION_KEY,
      expect.anything()
    );
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'domain 123',
        clientId: 'client id 123',
        authorizationParams: {
          foo: 'bar'
        }
      })
    );
  });

  it('should swallow exceptions upon installation', async () => {
    const plugin = createAuth0({
      domain: 'domain 123',
      clientId: 'client id 123',
      authorizationParams: {
        foo: 'bar'
      }
    });

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    expect(() => plugin.install(appMock)).not.toThrow();
  });

  it('should redirect to / when handleRedirect failed upon installation', async () => {
    const routerPushMock = jest.fn();
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    } as unknown as Router;

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('error', 'some_error');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/');
    });
  });

  it('should redirect to errorPath when handleRedirect failed upon installation', async () => {
    const routerPushMock = jest.fn();
    const plugin = createAuth0(
      {
        domain: '',
        clientId: ''
      },
      { errorPath: '/error' }
    );

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    } as unknown as Router;

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('error', 'some_error');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/error');
    });
  });

  it('should support redirect_uri', async () => {
    const plugin = createAuth0({
      domain: 'domain 123',
      clientId: 'client id 123',
      // @ts-expect-error
      redirect_uri: 'bar'
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalledWith(
      AUTH0_INJECTION_KEY,
      expect.anything()
    );
    expect(Auth0Client).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'domain 123',
        clientId: 'client id 123',
        authorizationParams: {
          redirect_uri: 'bar'
        }
      })
    );
  });

  it('should call checkSession on installation', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    plugin.install(appMock);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();
  });

  function flushPromises() {
    return new Promise(resolve => setTimeout(resolve));
  }

  it('should call handleRedirect callback on installation with code', async () => {
    const plugin = createAuth0(
      {
        domain: '',
        clientId: ''
      },
      {
        skipRedirectCallback: false
      }
    );

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).not.toHaveBeenCalled();
    expect(handleRedirectCallbackMock).toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should not call handleRedirect callback when skipRedirectCallback is true', async () => {
    const plugin = createAuth0(
      {
        domain: '',
        clientId: ''
      },
      {
        skipRedirectCallback: true
      }
    );

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).not.toHaveBeenCalled();
    });
  });

  it('should not call handleRedirect callback on installation when no state', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).not.toHaveBeenCalled();
    });
  });

  it('should call handleRedirect callback on installation when error', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('error', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(3);

    expect(checkSessionMock).not.toHaveBeenCalled();
    expect(handleRedirectCallbackMock).toHaveBeenCalled();

    return flushPromises().then(() => {
      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should call the router, if provided, with the target path', async () => {
    const routerPushMock = jest.fn();
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    } as unknown as Router;

    handleRedirectCallbackMock.mockResolvedValue({
      appState: {
        target: 'abc'
      }
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('abc');
    });
  });

  it('should call the router, if provided, with the default path when no target provided', async () => {
    const routerPushMock = jest.fn();
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    } as unknown as Router;

    handleRedirectCallbackMock.mockResolvedValue({
      appState: {}
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/');
    });
  });

  it('should call the router, if provided, with the default path when no appState', async () => {
    const routerPushMock = jest.fn();
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    } as unknown as Router;

    handleRedirectCallbackMock.mockResolvedValue({});

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/');
    });
  });

  it('should call the router, if provided, with the default path when handleRedirectCallback returns undefined', async () => {
    const routerPushMock = jest.fn();
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    appMock.config.globalProperties['$router'] = {
      push: routerPushMock
    } as unknown as Router;

    handleRedirectCallbackMock.mockResolvedValue(undefined);

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    return flushPromises().then(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/');
    });
  });

  it('should proxy loginWithRedirect', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const loginOptions = {
      authorizationParams: {
        audience: 'audience 123'
      }
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.loginWithRedirect(
      loginOptions
    );
    expect(loginWithRedirectMock).toHaveBeenCalledWith(loginOptions);
  });

  it('should proxy loginWithRedirect and handle redirect_uri', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.loginWithRedirect({
      // @ts-expect-error
      redirect_uri: 'bar'
    });
    expect(loginWithRedirectMock).toHaveBeenCalledWith({
      authorizationParams: {
        redirect_uri: 'bar'
      }
    });
  });

  it('should proxy loginWithPopup', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const loginOptions = {
      authorizationParams: {
        audience: 'audience 123'
      }
    };
    const popupOptions = {
      timeoutInSeconds: 60
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.loginWithPopup(
      loginOptions,
      popupOptions
    );
    expect(loginWithPopupMock).toHaveBeenCalledWith(loginOptions, popupOptions);
  });

  it('should proxy loginWithPopup and handle redirect_uri', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.loginWithPopup({
      // @ts-expect-error
      redirect_uri: 'bar'
    });
    expect(loginWithPopupMock).toHaveBeenCalledWith(
      {
        authorizationParams: {
          redirect_uri: 'bar'
        }
      },
      undefined
    );
  });

  it('should proxy logout', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const logoutOptions = {
      logoutParams: {
        localOnly: true,
        federated: true
      }
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.logout(logoutOptions);
    expect(logoutMock).toHaveBeenCalledWith(logoutOptions);
  });

  it('should proxy logout without options', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.logout();
    expect(logoutMock).toHaveBeenCalledWith(undefined);
  });

  it('should update state after localOnly logout', async () => {
    // TODO
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const logoutOptions = {
      openUrl: false as const
    };

    plugin.install(appMock);

    expect.assertions(4);
    await flushPromises();
    jest.clearAllMocks();

    await appMock.config.globalProperties.$auth0.logout(logoutOptions);

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(getIdTokenClaimsMock).toHaveBeenCalledTimes(1);
    expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
  });

  it('should not update state after logout', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    expect.assertions(4);
    await flushPromises();
    jest.clearAllMocks();

    await appMock.config.globalProperties.$auth0.logout();

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).not.toHaveBeenCalled();
    expect(getIdTokenClaimsMock).not.toHaveBeenCalled();
    expect(isAuthenticatedMock).not.toHaveBeenCalled();
  });

  it('should proxy getAccessTokenSilently', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const getTokenOptions = {
      authorizationParams: {
        scope: 'a b c'
      }
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.getAccessTokenSilently(
      getTokenOptions
    );
    expect(getTokenSilentlyMock).toHaveBeenCalledWith(getTokenOptions);
  });

  it('should proxy getAccessTokenSilently and handle redirect_uri', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.getAccessTokenSilently({
      // @ts-expect-error
      redirect_uri: 'bar'
    });
    expect(getTokenSilentlyMock).toHaveBeenCalledWith({
      authorizationParams: {
        redirect_uri: 'bar'
      }
    });
  });

  it('should proxy getAccessTokenWithPopup', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const getTokenOptions = {
      authorizationParams: {
        scope: 'a b c'
      }
    };
    const popupOptions = { timeoutInSeconds: 20 };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.getAccessTokenWithPopup(
      getTokenOptions,
      popupOptions
    );
    expect(getTokenWithPopupMock).toHaveBeenCalledWith(
      getTokenOptions,
      popupOptions
    );
  });

  it('should proxy getAccessTokenWithPopup and handle redirect_uri', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.getAccessTokenWithPopup({
      // @ts-expect-error
      redirect_uri: 'bar'
    });
    expect(getTokenWithPopupMock).toHaveBeenCalledWith(
      {
        authorizationParams: {
          redirect_uri: 'bar'
        }
      },
      undefined
    );
  });

  it('should be loading by default', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0.isLoading.value).toBe(true);
  });

  it('should not be loading once the SDK is finished', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$auth0.isLoading.value).toBe(
        false
      );
    });
  });

  it('should set isAuthenticated to false when not authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$auth0.isAuthenticated.value).toBe(
        false
      );
    });
  });

  it('should set isAuthenticated to true when authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    isAuthenticatedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$auth0.isAuthenticated.value).toBe(
        true
      );
    });
  });

  it('should set user to null when not authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    isAuthenticatedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$auth0.user.value).toBe(null);
    });
  });

  it('should set user when authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const userMock = { name: 'john' };

    isAuthenticatedMock.mockResolvedValue(true);
    getUserMock.mockResolvedValue(userMock);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$auth0.user.value).toStrictEqual(
        userMock
      );
    });
  });

  it('should set idTokenClaims to null when not authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    isAuthenticatedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(appMock.config.globalProperties.$auth0.idTokenClaims.value).toBe(
        null
      );
    });
  });

  it('should set idTokenClaims when authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const idTokenClaims = { name: 'john' };

    isAuthenticatedMock.mockResolvedValue(true);
    getIdTokenClaimsMock.mockResolvedValue(idTokenClaims);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      expect(
        appMock.config.globalProperties.$auth0.idTokenClaims.value
      ).toStrictEqual(idTokenClaims);
    });
  });

  it('should track errors when loginWithPopup throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    loginWithPopupMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.loginWithPopup();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when logout throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    logoutMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.logout({
        async openUrl() {}
      });
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when getAccessTokenWithPopup throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    getTokenWithPopupMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.getAccessTokenWithPopup();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when getAccessTokenSilently throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    getTokenSilentlyMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.getAccessTokenSilently();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when checkSession throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    try {
      plugin.install(appMock);

      checkSessionMock.mockRejectedValue('Some Error');

      await appMock.config.globalProperties.$auth0.checkSession();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when handleRedirectCallback throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.handleRedirectCallback();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should clear errors when successful', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    handleRedirectCallbackMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.handleRedirectCallback();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );

    handleRedirectCallbackMock.mockResolvedValue({});

    await appMock.config.globalProperties.$auth0.handleRedirectCallback();

    expect(appMock.config.globalProperties.$auth0.error.value).toBeFalsy();
  });

  it('should proxy getDpopNonce with id parameter', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    getDpopNonceMock.mockResolvedValue('auth0-nonce');

    const result = await appMock.config.globalProperties.$auth0.getDpopNonce(
      'my-api'
    );

    expect(getDpopNonceMock).toHaveBeenCalledWith('my-api');
    expect(result).toBe('auth0-nonce');
  });

  it('should proxy getDpopNonce without id parameter', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    getDpopNonceMock.mockResolvedValue('auth0-nonce');

    const result = await appMock.config.globalProperties.$auth0.getDpopNonce();

    expect(getDpopNonceMock).toHaveBeenCalledWith(undefined);
    expect(result).toBe('auth0-nonce');
  });

  it('should proxy setDpopNonce with id parameter', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.setDpopNonce(
      'nonce-abc',
      'my-api'
    );

    expect(setDpopNonceMock).toHaveBeenCalledWith('nonce-abc', 'my-api');
  });

  it('should proxy setDpopNonce without id parameter', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.setDpopNonce('nonce-abc');

    expect(setDpopNonceMock).toHaveBeenCalledWith('nonce-abc', undefined);
  });

  it('should proxy generateDpopProof', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    const params = {
      url: 'https://api.example.com/data',
      method: 'GET',
      accessToken: 'test-token',
      nonce: 'test-nonce'
    };

    const result =
      await appMock.config.globalProperties.$auth0.generateDpopProof(params);

    expect(generateDpopProofMock).toHaveBeenCalledWith(params);
    expect(result).toBe('mock-proof');
  });

  it('should proxy createFetcher', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    const fetcherConfig = {
      dpopNonceId: 'test-api',
      baseUrl: 'https://api.example.com'
    };

    const mockFetcher = {
      fetchWithAuth: jest
        .fn<any>()
        .mockResolvedValue({ status: 200, data: 'test' })
    };

    createFetcherMock.mockReturnValue(mockFetcher);

    const fetcher =
      appMock.config.globalProperties.$auth0.createFetcher(fetcherConfig);

    expect(createFetcherMock).toHaveBeenCalledWith(fetcherConfig);
    expect(fetcher).toBe(mockFetcher);
  });

  it('should proxy createFetcher without config', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    const mockFetcher = {
      fetchWithAuth: jest.fn<any>()
    };

    createFetcherMock.mockReturnValue(mockFetcher);

    const fetcher = appMock.config.globalProperties.$auth0.createFetcher();

    expect(createFetcherMock).toHaveBeenCalledWith(undefined);
    expect(fetcher).toBe(mockFetcher);
  });

  it('should track errors when getDpopNonce throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    getDpopNonceMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.getDpopNonce('my-api');
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when setDpopNonce throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    setDpopNonceMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.setDpopNonce(
        'nonce',
        'my-api'
      );
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when generateDpopProof throws', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    generateDpopProofMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.generateDpopProof({
        url: 'https://api.example.com/data',
        method: 'GET',
        accessToken: 'test-token'
      });
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should clear errors when getDpopNonce is successful', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: '',
      useDpop: true
    });

    plugin.install(appMock);

    // First call fails
    getDpopNonceMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.getDpopNonce('my-api');
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );

    // Second call succeeds
    getDpopNonceMock.mockResolvedValue('nonce-123');

    await appMock.config.globalProperties.$auth0.getDpopNonce('my-api');

    expect(appMock.config.globalProperties.$auth0.error.value).toBeFalsy();
  });
});
