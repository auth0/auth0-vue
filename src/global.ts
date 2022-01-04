export interface Auth0PluginOptions {
  domain: string;
  clientId: string;
}

export class Auth0Plugin {
  constructor(private options: Auth0PluginOptions) {}

  install() {
    console.log(this.options);
  }
}
