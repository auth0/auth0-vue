import { ref } from 'vue';
import './global';
import { Auth0Plugin, Auth0PluginOptions } from './global';

export * from './global';

/**
 * Creates the Auth0 plugin`.
 *
 * @param options The plugin options
 * @returns An instance of Auth0Plugin
 */
export default function createAuth0(options: Auth0PluginOptions) {
  return new Auth0Plugin(options);
}

export function createAuth02() {
  return {
    install(app: any) {
      const proxy = { foo: ref('Initial Value') };

      setTimeout(function () {
        proxy.foo.value = 'Updated Value';
      }, 2000);

      app.config.globalProperties.$auth0 = proxy;
    }
  };
}
