import {
  Auth0Client,
  Auth0ClientOptions,
  IdToken,
  LogoutOptions,
  PopupConfigOptions,
  PopupLoginOptions,
  RedirectLoginOptions,
  User
} from '@auth0/auth0-spa-js';
import { ref } from 'vue';

export class Auth0ClientProxy {
  private readonly client: Auth0Client;

  public isLoading = ref(true);
  public isAuthenticated = ref(false);
  public user = ref<User | undefined>({});
  public idTokenClaims = ref<IdToken | undefined>();

  constructor(options: Auth0ClientOptions) {
    this.client = new Auth0Client(options);
  }

  loginWithRedirect<TAppState>(options?: RedirectLoginOptions<TAppState>) {
    return this.client.loginWithRedirect(options);
  }

  loginWithPopup(options?: PopupLoginOptions, config?: PopupConfigOptions) {
    return this.__proxy(() => this.client.loginWithPopup(options, config));
  }

  logout(options?: LogoutOptions) {
    return this.__proxy(() => this.client.logout(options));
  }

  async checkSession() {
    return this.__proxy(() => this.client.checkSession());
  }

  async handleRedirectCallback() {
    return this.__proxy(() => this.client.handleRedirectCallback());
  }

  private async __refreshState() {
    this.isAuthenticated.value = await this.client.isAuthenticated();
    this.user.value = await this.client.getUser();
    this.idTokenClaims.value = await this.client.getIdTokenClaims();
    this.isLoading.value = false;
  }

  private async __proxy(cb: Function) {
    const result = await cb();
    await this.__refreshState();
    return result;
  }
}
