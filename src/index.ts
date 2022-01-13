// import './global';
// import { Auth0PluginOptions } from './global';
import { App, inject, ref, reactive } from 'vue';

// export * from './global';

/**
 * Creates the Auth0 plugin`.
 *
 * @param options The plugin options
 * @returns An instance of Auth0Plugin
 */
export function createAuth0() {
  // return new Auth0Plugin(options, vue);
  return {
    install(app: App) {
      const isLoading = ref(true);

      app.provide('$test', { isLoading });

      setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    }
  };
}

export function useAuth0() {
  return inject('$test');
}
