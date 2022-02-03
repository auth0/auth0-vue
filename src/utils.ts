import { watchEffect } from 'vue';

/**
 * @ignore
 */
export function watchEffectOncePromise<T>(watcher: () => T) {
  return new Promise<void>(resolve => {
    watchEffectOnce(watcher, resolve);
  });
}

/**
 * @ignore
 */
export function watchEffectOnce<T>(watcher: () => T, fn: Function) {
  const stopWatch = watchEffect(() => {
    if (watcher()) {
      fn();
      stopWatch();
    }
  });
}
