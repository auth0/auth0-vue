import { InjectionKey } from 'vue';
import { Auth0VueClient } from './interfaces';

/**
 * @ignore
 */
export const AUTH0_TOKEN = '$auth0';

/**
 * Injection token used to `provide` the `Auth0VueClient` instance. Can be used to pass to `inject()`
 *
 * ```js
 * inject(AUTH0_INJECTION_KEY)
 * ```
 */
export const AUTH0_INJECTION_KEY: InjectionKey<Auth0VueClient> =
  Symbol(AUTH0_TOKEN);
