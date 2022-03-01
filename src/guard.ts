import { RouteLocation } from 'vue-router';
import { watchEffectOnceAsync } from './utils';
import { client as auth0Client } from './plugin';
import { AUTH0_TOKEN } from './token';
import { Auth0VueClient } from './interfaces';
import { App, unref } from 'vue';

async function createGuardHandler(client: Auth0VueClient, to: RouteLocation) {
  const fn = async () => {
    if (unref(client.isAuthenticated)) {
      return true;
    }

    await client.loginWithRedirect({
      appState: { target: to.fullPath }
    });

    return false;
  };

  if (!unref(client.isLoading)) {
    return fn();
  }

  await watchEffectOnceAsync(() => !unref(client.isLoading));

  return fn();
}

export function createAuthGuard(app: App) {
  return async (to: RouteLocation) => {
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    return createGuardHandler(auth0, to);
  };
}

export async function authGuard(to: RouteLocation) {
  const auth0 = unref(auth0Client);

  return createGuardHandler(auth0, to);
}
