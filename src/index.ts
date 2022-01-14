import { Auth0Plugin, Auth0PluginOptions } from './plugin';

/**
 * Creates the Auth0 plugin`.
 *
 * @param options The plugin options
 * @returns An instance of Auth0Plugin
 */
export default function createAuth0(options: Auth0PluginOptions) {
  return new Auth0Plugin(options);
}
