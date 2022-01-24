import { App, watchEffect } from 'vue';
import { RouteLocation } from 'vue-router';
import { Auth0VueClient } from './client.proxy';
import { AUTH0_TOKEN } from './token';

export function createAuthGuard(app: App) {
  return (to: RouteLocation) => {
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    const fn = () => {
      if (auth0.isAuthenticated.value) {
        return true;
      }

      auth0.loginWithRedirect({ appState: { target: to.fullPath } });

      return false;
    };

    if (!auth0.isLoading.value) {
      return fn();
    }

    watchEffect(() => {
      if (!auth0.isLoading.value) {
        return fn();
      }
    });
  };
}
