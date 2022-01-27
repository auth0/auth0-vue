import { App, ref } from 'vue';
import { Auth0VueClient, createAuthGuard } from '../src/index';
import { AUTH0_TOKEN } from '../src/token';

let watchEffectMock;

jest.mock('vue', () => {
  return {
    ...(jest.requireActual('vue') as any),
    watchEffect: function (cb) {
      watchEffectMock = cb;
    }
  };
});

describe('createAuthGuard', () => {
  let appMock: App<any>;
  let auth0Mock: Partial<Auth0VueClient> = {
    loginWithRedirect: jest.fn().mockResolvedValue({}),
    isAuthenticated: ref(false),
    isLoading: ref(false)
  };

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

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(auth0Mock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should call loginWithRedirect', async () => {
    const guard = createAuthGuard(appMock);

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
