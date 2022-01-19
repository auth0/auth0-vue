import { inject } from 'vue';
import './global';
import { Auth0VueClient, Auth0Plugin, Auth0PluginOptions } from './global';
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
 * @param options The plugin options
 * @returns An instance of Auth0Plugin
 */
export function createAuth0(options: Auth0PluginOptions) {
  return new Auth0Plugin(options);
}

/**
 * Returns the registered Auth0 instance using Vue's `inject`.
 * @returns An instance of Auth0VueClient
 */
export function useAuth0(): Auth0VueClient {
  return inject(AUTH0_INJECTION_KEY);
}
