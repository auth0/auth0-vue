import { App } from 'vue';
import { RouteLocation } from 'vue-router';
import { Auth0VueClient } from './client.proxy';
import { AUTH0_TOKEN } from './token';
import { watchEffectOnce } from './utils';

export function createAuthGuard(app: App) {
  return (to: RouteLocation, from: RouteLocation, next: Function) => {
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    const fn = async () => {
      if (auth0.isAuthenticated.value) {
        return next(true);
      }

      auth0.loginWithRedirect({ appState: { target: to.fullPath } });

      next(false);
    };

    if (!auth0.isLoading.value) {
      return fn();
    }

    watchEffectOnce(() => !auth0.isLoading.value, fn);
  };
}
