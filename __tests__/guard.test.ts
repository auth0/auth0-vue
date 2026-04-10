import type { RouteLocation } from 'vue-router';
import { App, ref } from 'vue';
import { Auth0VueClient, authGuard, createAuthGuard } from '../src/index';
import { AUTH0_TOKEN } from '../src/token';
import { client } from './../src/plugin';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RedirectLoginOptions } from '@auth0/auth0-spa-js';

let watchEffectMock;

jest.mock('vue', () => {
  return {
    ...(jest.requireActual('vue') as any),
    watchEffect: function (cb) {
      watchEffectMock = cb;
      return () => {};
    }
  };
});

jest.mock('./../src/plugin', () => {
  return {
    ...(jest.requireActual('./../src/plugin') as any),
    client: ref({
      loginWithRedirect: jest.fn<any>().mockResolvedValue({}),
      isAuthenticated: ref(false),
      isLoading: ref(false)
    })
  };
});

describe('createAuthGuard', () => {
  let appMock: App<any>;
  let auth0Mock: Auth0VueClient = {
    loginWithRedirect: jest.fn<any>().mockResolvedValue({}),
    isAuthenticated: ref(false),
    isLoading: ref(false)
  } as unknown as Auth0VueClient;

  beforeEach(() => {
    auth0Mock.isAuthenticated.value = false;
    auth0Mock.isLoading.value = false;
    appMock = {
      config: {
        globalProperties: {
          [AUTH0_TOKEN]: auth0Mock
        }
      }
    } as any as App<any>;
  });

  it('should create the guard', async () => {
    const guard = createAuthGuard(appMock);

    auth0Mock.isAuthenticated.value = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should create the guard without app', async () => {
    const guard = createAuthGuard();

    client.value!.isAuthenticated = true as any;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should create the guard with empty options', async () => {
    const guard = createAuthGuard({});

    client.value!.isAuthenticated = true as any;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should create the guard with app in the options', async () => {
    const guard = createAuthGuard({ app: appMock });
    expect(guard).toBeDefined();
    expect(typeof guard).toBe('function');
  });

  it('should wait untill isLoading is false', async () => {
    const guard = createAuthGuard(appMock);

    auth0Mock.isLoading.value = true;

    expect.assertions(4);

    guard({
      fullPath: 'abc'
    } as any).then(() => {
      expect(true).toBeTruthy();
    });

    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();

    auth0Mock.isLoading.value = false;

    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();

    await watchEffectMock();

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalled();
  });

  it('should return true when authenticated', async () => {
    const guard = createAuthGuard(appMock);

    auth0Mock.isAuthenticated.value = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should call loginWithRedirect', async () => {
    const guard = createAuthGuard(appMock);

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as any);

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' }
      })
    );
  });

  it('should call loginWithRedirect with RedirectLoginOptions and use default appState value', async () => {
    const guard = createAuthGuard({
      app: appMock,
      redirectLoginOptions: {
        authorizationParams: {
          redirect_uri: '/custom_redirect'
        }
      } as RedirectLoginOptions
    });

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as RouteLocation);

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' },
        authorizationParams: {
          redirect_uri: '/custom_redirect'
        }
      })
    );
  });
  it('should call loginWithRedirect with RedirectLoginOptions and use provided appState value', async () => {
    const guard = createAuthGuard({
      app: appMock,
      redirectLoginOptions: {
        appState: { target: '123' },
        authorizationParams: {
          redirect_uri: '/custom_redirect2'
        }
      } as RedirectLoginOptions
    });

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as RouteLocation);

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: '123' },
        authorizationParams: {
          redirect_uri: '/custom_redirect2'
        }
      })
    );
  });

  it('should merge custom appState properties', async () => {
    const guard = createAuthGuard({
      app: appMock,
      redirectLoginOptions: {
        appState: {
          basePath: '/spa-subpath',
          customProp: 'customValue'
        },
        authorizationParams: {
          redirect_uri: '/custom_redirect'
        }
      } as RedirectLoginOptions
    });

    expect.assertions(1);

    await guard({
      fullPath: '/protected-route'
    } as RouteLocation);

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: {
          target: '/protected-route',
          basePath: '/spa-subpath',
          customProp: 'customValue'
        },
        authorizationParams: {
          redirect_uri: '/custom_redirect'
        }
      })
    );
  });

  /**
   * Previously, if the user provided an `appState` if the `redirectLoginOptions`, we would lose the guard's `target`.
   * This was reported as an issue in merging properties (https://github.com/auth0/auth0-vue/issues/434),
   * which is being fixed and verified by the test above (`should merge custom appState properties`).
   *
   * However, this also means that when a user provided a `target` in the `appState` of the `redirectLoginOptions`, we would lose the guard's `target`,
   * but receive the target from the `appState` defined on the `redirectLoginOptions`.
   *
   * For backwards compatibility, we have kept this behavior.
   * Any configured `appState.target` in `redirectLoginOptions` when creating the guard,
   * will take precedence over the guard's default `target` of the route's fullPath.
   */
  it('should merge custom appState properties while preserving redirectLoginOptions target', async () => {
    const guard = createAuthGuard({
      app: appMock,
      redirectLoginOptions: {
        appState: {
          target: '123',
          basePath: '/spa-subpath',
          customProp: 'customValue'
        },
        authorizationParams: {
          redirect_uri: '/custom_redirect'
        }
      } as RedirectLoginOptions
    });

    expect.assertions(1);

    await guard({
      fullPath: '/protected-route'
    } as RouteLocation);

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: {
          target: '123',
          basePath: '/spa-subpath',
          customProp: 'customValue'
        },
        authorizationParams: {
          redirect_uri: '/custom_redirect'
        }
      })
    );
  });
});
describe('authGuard', () => {
  let auth0Mock;

  beforeEach(() => {
    client.value!.isAuthenticated = false as any;
    client.value!.isLoading = false as any;
    auth0Mock = client.value;
  });

  it('should wait untill isLoading is false', async () => {
    const guard = authGuard;

    auth0Mock.isLoading = true;

    expect.assertions(4);

    guard({
      fullPath: 'abc'
    } as any).then(() => {
      expect(true).toBeTruthy();
    });

    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();

    auth0Mock.isLoading = false;

    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();

    await watchEffectMock();

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalled();
  });

  it('should return true when authenticated', async () => {
    const guard = authGuard;

    auth0Mock.isAuthenticated = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should call loginWithRedirect', async () => {
    const guard = authGuard;

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as any);

    expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' }
      })
    );
  });
});
