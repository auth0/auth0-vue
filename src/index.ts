import { inject } from 'vue';
import './global';
import {
  Auth0Client,
  Auth0Plugin,
  Auth0PluginOptions,
  AUTH0_TOKEN
} from './global';

export * from './global';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    [AUTH0_TOKEN]: Auth0Client;
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
 * @returns An instance of Auth0ClientProxy
 */
export function useAuth0(): Auth0Client {
  return inject(AUTH0_TOKEN);
}
