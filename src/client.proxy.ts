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
import { Ref, ref } from 'vue';

export class Auth0ClientProxy {
  private readonly client: Auth0Client;

  public isLoading: Ref<boolean>;
  public isAuthenticated: Ref<boolean>;
  public user: Ref<User | undefined>;
  public idTokenClaims: Ref<IdToken | undefined>;

  constructor(options: Auth0ClientOptions, vue?: any) {
    this.client = new Auth0Client(options);

    this.isLoading = vue ? vue.ref(true) : ref(true);
    this.isAuthenticated = vue ? vue.ref(false) : ref(false);
    this.user = vue ? vue.ref({}) : ref({});
    this.idTokenClaims = vue ? vue.ref() : ref();
  }

  async loginWithRedirect(options?: RedirectLoginOptions) {
    return this.client.loginWithRedirect(options);
  }

  async loginWithPopup(
    options?: PopupLoginOptions,
    config?: PopupConfigOptions
  ) {
    return this.__proxy(() => this.client.loginWithPopup(options, config));
  }

  async logout(options?: LogoutOptions) {
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
