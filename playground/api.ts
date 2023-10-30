import type { GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';
import { auth0 } from './auth0';

export async function getAccessTokenSilentlyOutsideComponent(
  options: GetTokenSilentlyOptions
) {
  return auth0.getAccessTokenSilently(options);
}
