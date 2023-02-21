import type { RouteLocation, NavigationGuardNext } from 'vue-router';
import { watchEffectOnceAsync } from './utils';
import { client as auth0Client } from './plugin';
import { AUTH0_TOKEN } from './token';
import type { Auth0VueClient } from './interfaces';
import type { App } from 'vue';
import { unref } from 'vue';
import { RedirectLoginOptions } from '@auth0/auth0-spa-js';

async function createGuardHandler(
  client: Auth0VueClient,
  to: RouteLocation,
  redirectLoginOptions?: RedirectLoginOptions
) {
  const fn = async () => {
    if (unref(client.isAuthenticated)) {
      return true;
    }

    await client.loginWithRedirect({
      appState: { target: to.fullPath },
      ...redirectLoginOptions
    });

    return false;
  };

  if (!unref(client.isLoading)) {
    return fn();
  }

  await watchEffectOnceAsync(() => !unref(client.isLoading));

  return fn();
}

export function createAuthGuard(
  app?: App,
  redirectLoginOptions?: RedirectLoginOptions
) {
  return async (to: RouteLocation) => {
    // eslint-disable-next-line security/detect-object-injection
    const auth0 = app
      ? (app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient)
      : unref(auth0Client);

    return createGuardHandler(auth0, to, redirectLoginOptions);
  };
}

export async function authGuard(to: RouteLocation) {
  const auth0 = unref(auth0Client);

  return createGuardHandler(auth0, to);
}
