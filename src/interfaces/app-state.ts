/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AppState {
  /**
   * Target path the app gets routed to after
   * handling the callback from Auth0 (defaults to '/')
   */
  target?: string;

  /**
   * Any custom parameter to be stored in appState
   */
  [key: string]: any;
}
