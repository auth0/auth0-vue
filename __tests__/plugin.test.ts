import { App } from 'vue';
import createAuth0 from '../src/index';

const loginWithRedirectMock = jest.fn();
const loginWithPopupMock = jest.fn();
const logoutMock = jest.fn();
const checkSessionMock = jest.fn();
const handleRedirectCallbackMock = jest.fn();

jest.mock('@auth0/auth0-spa-js', () => {
  return {
    Auth0Client: jest.fn().mockImplementation(() => {
      return {
        checkSession: checkSessionMock,
        handleRedirectCallback: handleRedirectCallbackMock,
        loginWithRedirect: loginWithRedirectMock,
        loginWithPopup: loginWithPopupMock,
        logout: logoutMock,
        isAuthenticated: jest.fn(),
        getUser: jest.fn(),
        getIdTokenClaims: jest.fn()
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

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalled();
  });

  it('should create a proxy on installation by passing global Vue', async () => {
    const plugin = createAuth0(
      {
        domain: '',
        clientId: ''
      },
      {
        ref: () => ({ value: null })
      }
    );

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    plugin.install(appMock);

    expect(appMock.config.globalProperties.$auth0).toBeTruthy();
    expect(appMock.provide).toHaveBeenCalled();
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

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

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

    const appMock: App<any> = {
      config: {
        globalProperties: {}
      },
      provide: jest.fn()
    } as any as App<any>;

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.loginWithRedirect();
    expect(loginWithRedirectMock).toHaveBeenCalled();
  });

  it('should proxy loginWithPopup', async () => {
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

    await appMock.config.globalProperties.$auth0.loginWithPopup();
    expect(loginWithPopupMock).toHaveBeenCalled();
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

    plugin.install(appMock);

    await appMock.config.globalProperties.$auth0.logout();
    expect(logoutMock).toHaveBeenCalled();
  });
});
