import { App, watchEffect } from 'vue';
import { RouteLocation } from 'vue-router';
import { Auth0VueClient } from './client.proxy';
import { AUTH0_TOKEN } from './token';

function waitForLoading(auth0: Auth0VueClient) {
  return new Promise<void>(resolve => {
    watchEffect(() => {
      if (!auth0.isLoading.value) {
        resolve();
      }
    });
  });
}

export function createAuthGuard(app: App) {
  return async (to: RouteLocation) => {
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    const fn = async () => {
      if (auth0.isAuthenticated.value) {
        return true;
      }

      await auth0.loginWithRedirect({ appState: { target: to.fullPath } });
    };

    if (!auth0.isLoading.value) {
      return fn();
    }

    await waitForLoading(auth0);

    return fn();
  };
}
