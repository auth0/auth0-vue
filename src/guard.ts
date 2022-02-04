import { App } from 'vue';
import { RouteLocation } from 'vue-router';
import { Auth0VueClient } from './interfaces';
import { AUTH0_TOKEN } from './token';
import { watchEffectOnceAsync } from './utils';

export function createAuthGuard(app: App) {
  return async (to: RouteLocation) => {
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    const fn = async () => {
      if (auth0.isAuthenticated.value) {
        return true;
      }

      await auth0.loginWithRedirect({ appState: { target: to.fullPath } });

      return false;
    };

    if (!auth0.isLoading.value) {
      return fn();
    }

    await watchEffectOnceAsync(() => !auth0.isLoading.value);

    return fn();
  };
}
