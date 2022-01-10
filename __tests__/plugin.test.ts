import { Auth0Client } from '@auth0/auth0-spa-js';
import { App } from 'vue';
import createAuth0 from '../src/index';

const loginWithRedirectMock = jest.fn();
const loginWithPopupMock = jest.fn();
const logoutMock = jest.fn();
const checkSessionMock = jest.fn();
const handleRedirectCallbackMock = jest.fn();
const isAuthenticatedMock = jest.fn().mockResolvedValue(false);
const getUserMock = jest.fn().mockResolvedValue(null);
const getIdTokenClaimsMock = jest.fn().mockResolvedValue(null);

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
        getIdTokenClaims: getIdTokenClaimsMock
      };
    })
  };
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
      domain: '',
      clientId: ''
    });

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalled();
  });

  it('should create a proxy on installation by passing global Vue', async () => {
    const plugin = createAuth0(
      {
        domain: 'domain 123',
        clientId: 'client id 123',
        foo: 'bar'
      },
      {
        ref: () => ({ value: null })
      }
    );

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalled();
    expect(Auth0Client).toHaveBeenCalledWith({
      domain: 'domain 123',
      client_id: 'client id 123',
      foo: 'bar'
    });
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

  it('should call handleRedirect callback on installation', async () => {
    const plugin = createAuth0({
      domain: '',
      clientId: ''
    });

    const urlParams = new URLSearchParams(window.location.search);

    urlParams.set('code', '123');

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
      clientId: ''
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
      clientId: ''
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
      clientId: ''
    });

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    const logoutOptions = {
      localOnly: true,
      federated: true
    };

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.logout(logoutOptions);
    expect(logoutMock).toHaveBeenCalledWith(logoutOptions);
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
      jest.runAllTimers();
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
      jest.runAllTimers();
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
      jest.runAllTimers();
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
      jest.runAllTimers();
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
      jest.runAllTimers();
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
      jest.runAllTimers();
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
      jest.runAllTimers();
      expect(
        appMock.config.globalProperties.$auth0.idTokenClaims.value
      ).toStrictEqual(idTokenClaims);
    });
  });
});
