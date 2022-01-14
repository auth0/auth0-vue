import { inject } from 'vue';
import './global';
import {
  Auth0ClientProxy,
  Auth0Plugin,
  Auth0PluginOptions,
  AUTH0_TOKEN
} from './global';

export * from './global';

/**
 * Creates the Auth0 plugin`.
 *
 * @param options The plugin options
 * @returns An instance of Auth0Plugin
 */
export function createAuth0(options: Auth0PluginOptions) {
  return new Auth0Plugin(options);
}

export function useAuth0(): Auth0ClientProxy {
  return inject(AUTH0_TOKEN);
}
