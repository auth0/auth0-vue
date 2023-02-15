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
  from?: RouteLocation,
  next?: NavigationGuardNext,
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

export function createAuthGuard(app: App) {
  return async (
    to: RouteLocation,
    from?: RouteLocation,
    next?: NavigationGuardNext,
    redirectLoginOptions?: RedirectLoginOptions
  ) => {
    // eslint-disable-next-line security/detect-object-injection
    const auth0 = app.config.globalProperties[AUTH0_TOKEN] as Auth0VueClient;

    return createGuardHandler(auth0, to, from, next, redirectLoginOptions);
  };
}

export async function authGuard(
  to: RouteLocation,
  from?: RouteLocation,
  next?: NavigationGuardNext,
  redirectLoginOptions?: RedirectLoginOptions
) {
  const auth0 = unref(auth0Client);

  return createGuardHandler(auth0, to, from, next, redirectLoginOptions);
}
