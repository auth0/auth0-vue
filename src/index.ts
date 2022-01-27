import { inject } from 'vue';
import { Router } from 'vue-router';
import './global';
import {
  Auth0VueClient,
  Auth0Plugin,
  Auth0PluginOptions,
  Auth0VueClientOptions
} from './global';
import { AUTH0_INJECTION_KEY, AUTH0_TOKEN } from './token';

export * from './global';
export { AUTH0_INJECTION_KEY } from './token';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    [AUTH0_TOKEN]: Auth0VueClient;
  }
}

/**
 * Creates the Auth0 plugin.
 *
 * @param clientOptions The Auth Vue Client Options
 * @param pluginOptions Additional Plugin Configuration Options
 * @returns An instance of Auth0Plugin
 */
export function createAuth0(
  clientOptions: Auth0VueClientOptions,
  pluginOptions?: Auth0PluginOptions
) {
  return new Auth0Plugin(clientOptions, pluginOptions);
}

/**
 * Returns the registered Auth0 instance using Vue's `inject`.
 * @returns An instance of Auth0VueClient
 */
export function useAuth0(): Auth0VueClient {
  return inject(AUTH0_INJECTION_KEY);
}
