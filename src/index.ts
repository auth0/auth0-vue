import './global';
import { Auth0Plugin, Auth0PluginOptions } from './global';

export * from './global';

/**
 * Creates the Auth0 plugin`.
 *
 * @param options The plugin options
 * @returns An instance of Auth0Plugin
 */
export default function createAuth0(options: Auth0PluginOptions, vue?: any) {
  return new Auth0Plugin(options, vue);
}
