import { App, watchEffect } from 'vue';
import { Auth0VueClient } from './client.proxy';
import { AUTH0_TOKEN } from './token';

export function createAuthGuard(app: App) {
  return (to: any, from: any, next: Function) => {
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    const fn = () => {
      if (auth0.isAuthenticated.value) {
        return next();
      }

      auth0.loginWithRedirect({ appState: { target: to.fullPath } });

      return next(false);
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
