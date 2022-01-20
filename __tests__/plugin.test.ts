import { Auth0Client } from '@auth0/auth0-spa-js';
import { App } from 'vue';
import { AUTH0_INJECTION_KEY, createAuth0, useAuth0 } from '../src/index';

const loginWithRedirectMock = jest.fn();
const loginWithPopupMock = jest.fn();
const logoutMock = jest.fn();
const checkSessionMock = jest.fn();
const handleRedirectCallbackMock = jest.fn();
const isAuthenticatedMock = jest.fn().mockResolvedValue(false);
const getUserMock = jest.fn().mockResolvedValue(null);
const getIdTokenClaimsMock = jest.fn().mockResolvedValue(null);
const buildAuthorizeUrlMock = jest.fn().mockResolvedValue(null);
const buildLogoutUrlMock = jest.fn().mockResolvedValue(null);
const getTokenSilentlyMock = jest.fn().mockResolvedValue(null);
const getTokenWithPopupMock = jest.fn().mockResolvedValue(null);

jest.mock('vue', () => {
  const originalModule = jest.requireActual('vue');
  return {
    __esModule: true,
    ...originalModule,
    inject: jest.fn().mockResolvedValue(null)
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
        getTokenWithPopup: getTokenWithPopupMock
      };
    })
  };
});

describe('createAuth0', () => {
  it('should create a plugin', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });
    expect(plugin.install).toBeTruthy();
  });
});

describe('useAuth0', () => {
  it('should call inject', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });
    const res = useAuth0();
    expect(res).toBeDefined();
  });
});

describe('Auth0Plugin', () => {
  const savedLocation = window.location;
  const savedHistory = window.history;
  let replaceStateMock = jest.fn();
  let appMock: App<any>;

  beforeEach(() => {
    delete window.location;
    window.location = Object.assign(new URL('https://example.org'), {
      ancestorOrigins: '',
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn()
    }) as any;

    delete window.history;
    window.history = {
      replaceState: replaceStateMock
    } as any;

    isAuthenticatedMock.mockResolvedValue(false);

    appMock = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;
  });
  afterEach(() => {
    window.location = savedLocation;
    window.history = savedHistory;
  });

  it('should create a proxy on installation', async () => {
    const plugin = createAuth0({
      domain: 'domain 123',
      client_id: 'client id 123',
      foo: 'bar'
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
        client_id: 'client id 123',
        foo: 'bar'
      })
    );
  });

  it('should call checkSession on installation', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
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
    const plugin = createAuth0({
      domain: '',
      client_id: '',
      skipRedirectCallback: false
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect(checkSessionMock).not.toHaveBeenCalled();
    expect(handleRedirectCallbackMock).toHaveBeenCalled();

    return flushPromises().then(() => {
      jest.runAllTimers();

      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should not call handleRedirect callback when skipRedirectCallback is true', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: '',
      skipRedirectCallback: true
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();

    return flushPromises().then(() => {
      jest.runAllTimers();

      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should not call handleRedirect callback on installation when no state', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect(checkSessionMock).toHaveBeenCalled();
    expect(handleRedirectCallbackMock).not.toHaveBeenCalled();

    return flushPromises().then(() => {
      jest.runAllTimers();

      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should call handleRedirect callback on installation when error', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('error', '123');
    urlParams.set('state', 'xyz');

    window.location.search = urlParams as any;

    plugin.install(appMock);

    expect(checkSessionMock).not.toHaveBeenCalled();
    expect(handleRedirectCallbackMock).toHaveBeenCalled();

    return flushPromises().then(() => {
      jest.runAllTimers();

      expect(replaceStateMock).toHaveBeenCalled();
    });
  });

  it('should proxy loginWithRedirect', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const loginOptions = {
      audience: 'audience 123'
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.loginWithRedirect(
      loginOptions
    );
    expect(loginWithRedirectMock).toHaveBeenCalledWith(loginOptions);
  });

  it('should proxy loginWithPopup', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const loginOptions = {
      audience: 'audience 123'
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

  it('should proxy logout', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const logoutOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.logout(logoutOptions);
    expect(logoutMock).toHaveBeenCalledWith(logoutOptions);
  });

  it('should proxy getAccessTokenSilently', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const getTokenOptions = {
      scope: 'a b c'
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.getAccessTokenSilently(
      getTokenOptions
    );
    expect(getTokenSilentlyMock).toHaveBeenCalledWith(getTokenOptions);
  });

  it('should proxy getAccessTokenWithPopup', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const getTokenOptions = { scope: 'a b c' };
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

  it('should proxy buildAuthorizeUrl', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const loginOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.buildAuthorizeUrl(
      loginOptions
    );
    expect(buildAuthorizeUrlMock).toHaveBeenCalledWith(loginOptions);
  });

  it('should proxy buildLogoutUrl', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const logoutUrlOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.buildLogoutUrl(
      logoutUrlOptions
    );
    expect(buildLogoutUrlMock).toHaveBeenCalledWith(logoutUrlOptions);
  });

  it('should be loading by default', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0.isLoading.value).toBe(true);
  });

  it('should not be loading once the SDK is finished', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(appMock.config.globalProperties.$auth0.isLoading.value).toBe(
        false
      );
    });
  });

  it('should set isAuthenticated to false when not authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(appMock.config.globalProperties.$auth0.isAuthenticated.value).toBe(
        false
      );
    });
  });

  it('should set isAuthenticated to true when authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    isAuthenticatedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(appMock.config.globalProperties.$auth0.isAuthenticated.value).toBe(
        true
      );
    });
  });

  it('should set user to null when not authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    isAuthenticatedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(appMock.config.globalProperties.$auth0.user.value).toBe(null);
    });
  });

  it('should set user when authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const userMock = { name: 'john' };

    isAuthenticatedMock.mockResolvedValue(true);
    getUserMock.mockResolvedValue(userMock);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(appMock.config.globalProperties.$auth0.user.value).toStrictEqual(
        userMock
      );
    });
  });

  it('should set idTokenClaims to null when not authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    isAuthenticatedMock.mockResolvedValue(true);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(appMock.config.globalProperties.$auth0.idTokenClaims.value).toBe(
        null
      );
    });
  });

  it('should set idTokenClaims when authenticated', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
    });

    const idTokenClaims = { name: 'john' };

    isAuthenticatedMock.mockResolvedValue(true);
    getIdTokenClaimsMock.mockResolvedValue(idTokenClaims);

    plugin.install(appMock);

    expect.assertions(1);

    return flushPromises().then(() => {
      jest.runAllTimers();
      expect(
        appMock.config.globalProperties.$auth0.idTokenClaims.value
      ).toStrictEqual(idTokenClaims);
    });
  });

  it('should track errors when loginWithPopup throws', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
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
      client_id: ''
    });

    plugin.install(appMock);

    logoutMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.logout();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when getAccessTokenWithPopup throws', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
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
      client_id: ''
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
      client_id: ''
    });

    plugin.install(appMock);

    checkSessionMock.mockRejectedValue('Some Error');

    try {
      await appMock.config.globalProperties.$auth0.checkSession();
    } catch (e) {}

    expect(appMock.config.globalProperties.$auth0.error.value).toEqual(
      'Some Error'
    );
  });

  it('should track errors when handleRedirectCallback throws', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
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

  it('should clear errors when succesful', async () => {
    const plugin = createAuth0({
      domain: '',
      client_id: ''
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
});
