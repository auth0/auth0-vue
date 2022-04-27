import { watchEffect } from 'vue';

/**
 * @ignore
 * Run watchEffect untill the watcher returns true, then stop the watch.
 * Once it returns true, the promise will resolve.
 */
export function watchEffectOnceAsync<T>(watcher: () => T) {
  return new Promise<void>(resolve => {
    watchEffectOnce(watcher, resolve);
  });
}

/**
 * @ignore
 * Run watchEffect untill the watcher returns true, then stop the watch.
 * Once it returns true, it will call the provided function.
 */
export function watchEffectOnce<T>(watcher: () => T, fn: Function) {
  const stopWatch = watchEffect(() => {
    if (watcher()) {
      fn();
      stopWatch();
    }
  });
}

/**
 * @ignore
 * Helper function to bind methods to itself, useful when using Vue's `provide` / `inject` API's.
 */
export function bindPluginMethods(plugin: any, exclude: string[]) {
  Object.getOwnPropertyNames(Object.getPrototypeOf(plugin))
    .filter(method => !exclude.includes(method))
    .forEach(method => (plugin[method] = plugin[method].bind(plugin)));
}
