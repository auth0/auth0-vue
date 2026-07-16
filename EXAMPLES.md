# Examples using auth0-vue

- [Add login to your application](#add-login-to-your-application)
- [Display the user profile](#display-the-user-profile)
- [Add logout to your application](#add-logout-to-your-application)
- [Calling an API](#calling-an-api)
- [Accessing ID Token claims](#accessing-id-token-claims)
- [Error Handling](#error-handling)
- [Protecting a route](#protecting-a-route)
- [Protecting a route when using multiple Vue applications](#protecting-a-route-when-using-multiple-vue-applications)
- [Accessing Auth0Client outside of a component](#accessing-auth0client-outside-of-a-component)
- [Organizations](#organizations)
- [Device-bound tokens with DPoP](#device-bound-tokens-with-dpop)
- [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
- [Step-Up Authentication](#step-up-authentication)
- [Custom Token Exchange](#custom-token-exchange)
- [Passkeys](#passkeys)
- [MyAccount API](#myaccount-api)

## Add login to your application

In order to add login to your application you can use the `loginWithRedirect` function that is exposed on the return value of `useAuth0`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect } = useAuth0();

      return {
        login: () => {
          loginWithRedirect();
        }
      };
    }
  };
</script>
```

Once setup returns the correct method, you can call that method from your component's HTML.

```html
<template>
  <div>
    <button @click="login">Log in</button>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <button @click="login">Log in</button>
  </div>
</template>

<script>
  export default {
    methods: {
      login() {
        this.$auth0.loginWithRedirect();
      }
    }
  };
</script>
```

</details>

## Display the user profile

To display the user's information, you can use the reactive `user` property exposed by the return value of `useAuth0`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect, user } = useAuth0();

      return {
        login: () => {
          loginWithRedirect();
        },
        user
      };
    }
  };
</script>
```

Once setup returns the SDK's reactive property, you can access that property from your component's HTML.

```html
<template>
  <div>
    <h2>User Profile</h2>
    <button @click="login">Log in</button>
    <pre>
        <code>{{ user }}</code>
      </pre>
  </div>
</template>
```

Note: Ensure the user is authenticated by implementing [login in your application](#add-login-to-your-application) before accessing the user's profile.

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <h2>User Profile</h2>
    <button @click="login">Log in</button>
    <pre>
      <code>{{ user }}</code>
    </pre>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        user: this.$auth0.user
      };
    },
    methods: {
      login() {
        this.$auth0.loginWithRedirect();
      }
    }
  };
</script>
```

</details>

## Add logout to your application

Adding logout to your application you be done by using the `logout` function that is exposed on the return value of `useAuth0`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { logout } = useAuth0();

      return {
        logout: () => {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }
      };
    }
  };
</script>
```

Once setup returns the correct method, you can call that method from your component's HTML.

```html
<template>
  <div>
    <button @click="logout">Log out</button>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <button @click="logout">Log out</button>
  </div>
</template>

<script>
  export default {
    methods: {
      logout() {
        this.$auth0.logout({
          logoutParams: { returnTo: window.location.origin }
        });
      }
    }
  };
</script>
```

</details>

## Calling an API

To call an API, configure the plugin by setting the `audience` to the API Identifier of the API in question:

```js
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    authorizationParams: {
      redirect_uri: '<MY_CALLBACK_URL>',
      audience: '<AUTH0_AUDIENCE>'
    }
  })
);

app.mount('#app');
```

After configuring the plugin, you will need to retrieve an Access Token and set it on the `Authorization` header of your request.

Retrieving an Access Token can be done by using the `getAccessTokenSilently` function that is exposed on the return value of `useAuth0`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { getAccessTokenSilently } = useAuth0();

      return {
        doSomethingWithToken: async () => {
          const token = await getAccessTokenSilently();
          const response = await fetch('https://api.example.com/posts', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await response.json();
        }
      };
    }
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    methods: {
      async doSomethingWithToken() {
        const token = await this.$auth0.getAccessTokenSilently();
        const response = await fetch('https://api.example.com/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
      }
    }
  };
</script>
```

</details>

## Accessing ID token claims

To get access to the user's claims, you can use the reactive `idTokenClaims` property exposed by the return value of `useAuth0`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect, idTokenClaims } = useAuth0();

      return {
        login: () => {
          loginWithRedirect();
        },
        idTokenClaims
      };
    }
  };
</script>
```

Once setup returns the SDK's reactive property, you can access that property from your component's HTML.

```html
<template>
  <div>
    <h2>ID Token Claims</h2>
    <button @click="login">Log in</button>
    <pre>
      <code>{{ idTokenClaims }}</code>
    </pre>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <h2>ID Token Claims</h2>
    <button @click="login">Log in</button>
    <pre>
      <code>{{ idTokenClaims }}</code>
    </pre>
  </div>
</template>
<script>
  export default {
    data: function () {
      return {
        idTokenClaims: this.$auth0.idTokenClaims
      };
    },
    methods: {
      login() {
        this.$auth0.loginWithRedirect();
      }
    }
  };
</script>
```

</details>

## Error handling

When using this SDK, it could be the case that it is unable to correctly handle the authentication flow for a variety of reasons (e.g. an expired session with Auth0 when trying to get a token silently). In these situations, calling the actual methods will result in an exception being thrown (e.g. `login_required`). On top of that, these errors are made available through the SDK's reactive `error` property:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { error } = useAuth0();

      return {
        error
      };
    }
  };
</script>
```

Once setup returns the SDK's `error` property, you can access that property from your component's HTML.

```html
<template>
  <div>
    <h2>Error Handling</h2>
    <pre>
      <code>{{ error?.error }}</code>
    </pre>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <h2>Error Handling</h2>
    <pre>
      <code>{{ error?.error }}</code>
    </pre>
  </div>
</template>
<script>
  export default {
    data: function () {
      return {
        error: this.$auth0.error
      };
    }
  };
</script>
```

</details>

## Protecting a route

If you are using our Auth0-Vue SDK with [Vue-Router](https://next.router.vuejs.org/), you can protect a route by using the [Navigation Guard](https://next.router.vuejs.org/guide/advanced/navigation-guards.html) provided by the SDK.

> ⚠️ **Note**: the order in which the Router and Auth0 Vue plugin are registered is important. You must register the Router before the Auth0 SDK or you might see unexpected behavior.

```ts
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createAuth0, authGuard } from '@auth0/auth0-vue';

const app = createApp(App);
app.use(createRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      beforeEnter: authGuard
    }
  ],
  history: createWebHashHistory()
}));
app.use(createAuth0({ ... }));
app.mount('#app');
```

Applying the guard to a route, as shown above, will only allow access to authenticated users. When a non-authenticated user tries to access a protected route, the SDK will redirect the user to Auth0 and redirect them back to your application's `redirect_uri` (which is configured in `createAuth0`, see [Configuring the plugin](#configuring-the-plugin)). Once the SDK is done processing the response from Auth0 and exchanging it for tokens, the SDK will redirect the user back to the protected route they were trying to access initially.

> ⚠️ If you are using multiple Vue applications with our SDK on a single page, using the above guard does not support a situation where the Auth0 Domain and ClientID would be different. In that case, read [our guide on protecting a route when using multiple Vue applications](https://github.com/auth0/auth0-vue/blob/main/EXAMPLES.md#1-protecting-a-route-when-using-multiple-vue-applications).

## Protecting a route when using multiple Vue applications

When using multiple Vue applications that use their own version of the Auth0Plugin (using a different Domain and/or Client ID), an instance of the Vue Application needs to be passed down to the `createAuthGuard()` function exposed by the SDK.

```jsx
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createAuth0, createAuthGuard } from '@auth0/auth0-vue';
import App from './App.vue';
import Home from './components/Home.vue';
import Profile from './components/Profile.vue';

const app = createApp(App);
app.use(
  createRouter({
    linkActiveClass: 'btn-primary',
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/profile',
        name: 'profile',
        component: Profile,
        beforeEnter: createAuthGuard(app)
      }
    ],
    history: createWebHashHistory()
  })
);
app.use(
  createAuth0({
    domain,
    clientId
  })
);
app.mount('#app');
```

Doing the above ensures every guard is connected to the Auth0Plugin that's configured in the same Vue application.

## Accessing Auth0Client outside of a component

To be able to access `Auth0Client` outside of the component, there are a couple of things you need to do.

First of all, start with moving the creation of the plugin to an external file:

```ts
export const auth0 = createAuth0({ ... });
```

Next, you can import the exported plugin instance when configuring the Vue app.

```ts
import { auth0 } from './auth0';

createApp(App).use(auth0).mount('#app');
```

However, you can now also import the exported plugin instance anywhere else and access it's methods

```ts
import { auth0 } from './auth0';

export async function getAccessTokenSilentlyOutsideComponent(options) {
  return auth0.getAccessTokenSilently(options);
}
```

This would allow you to interact with our SDK from outside of components, such as Axios interceptors.

**Note**: Be aware that none of the above is specific to our SDK, but would translate to any plugin in Vue.

## Organizations

[Organizations](https://auth0.com/docs/organizations) is a set of features that provide better support for developers who build and maintain SaaS and Business-to-Business (B2B) applications.

Note that Organizations is currently only available to customers on our Enterprise and Startup subscription plans.

### Log in to an organization

Log in to an organization by specifying the `organization` parameter when registering the plugin:

```js
app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    authorizationParams: {
      redirect_uri: '<MY_CALLBACK_URL>',
      organization: 'YOUR_ORGANIZATION_ID_OR_NAME'
    }
  })
);
```

You can also specify the organization when logging in:

```js
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect, loginWithPopup } = useAuth0();

      return {
        login: () => {
          // Using a redirect
          loginWithRedirect({
            authorizationParams: {
              organization: 'YOUR_ORGANIZATION_ID_OR_NAME',
            }
          });

          // Using a popup window
          loginWithPopup({
            authorizationParams: {
              organization: 'YOUR_ORGANIZATION_ID_OR_NAME',
            }
          })
        }
      };
    }
  };
</script>
```

### Accept user invitations

Accept a user invitation through the SDK by creating a route within your application that can handle the user invitation URL, and log the user in by passing the `organization` and `invitation` parameters from this URL. You can either use `loginWithRedirect` or `loginWithPopup` as needed.

```js
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect, loginWithPopup } = useAuth0();
      const route = useRoute();
      const { organization, invitation } = route.params;

      return {
        login: () => {
          // Using a redirect
          loginWithRedirect({
            authorizationParams: {
              organization,
              invitation,
            }
          });

          // Using a popup window
          loginWithPopup({
            authorizationParams: {
              organization,
              invitation,
            }
          })
        }
      };
    }
  };
</script>
```

## Device-bound tokens with DPoP

**Demonstrating Proof-of-Possession** —or simply **DPoP**— is a recent OAuth 2.0 extension defined in [RFC9449](https://datatracker.ietf.org/doc/html/rfc9449).

It defines a mechanism for securely binding tokens to a specific device using cryptographic signatures. Without it, **a token leak caused by XSS or other vulnerabilities could allow an attacker to impersonate the real user.**

To support DPoP in `auth0-vue`, some APIs available in modern browsers are required:

- [Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto): allows to create and use cryptographic keys, which are used to generate the proofs (i.e. signatures) required for DPoP.

- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API): enables the use of cryptographic keys [without exposing the private material](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto#storing_keys).

The following OAuth 2.0 flows are currently supported by `auth0-vue`:

- [Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow) (`authorization_code`).

- [Refresh Token Flow](https://auth0.com/docs/secure/tokens/refresh-tokens) (`refresh_token`).

> [!IMPORTANT]
> Currently, only the `ES256` algorithm is supported.

### Enabling DPoP

DPoP is disabled by default. To enable it, set the `useDpop` option to `true` when configuring the plugin. For example:

```js
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    useDpop: true, // 👈
    authorizationParams: {
      redirect_uri: '<MY_CALLBACK_URL>',
    },
  })
);

app.mount('#app');
```

After enabling DPoP, **every new session using a supported OAuth 2.0 flow in Auth0 will begin transparently to use tokens that are cryptographically bound to the current browser**.

> [!IMPORTANT]
> DPoP will only be used for new user sessions created after enabling it. Any previously existing sessions will continue using non-DPoP tokens until the user logs in again.
>
> You decide how to handle this transition. For example, you might require users to log in again the next time they use your application.

> [!NOTE]
> Using DPoP requires storing some temporary data in the user's browser. When you log the user out with `logout()`, this data is deleted.

> [!TIP]
> If all your clients are already using DPoP, you may want to increase security by making Auth0 reject any non-DPoP interactions. See [the docs on Sender Constraining](https://auth0.com/docs/secure/sender-constraining/configure-sender-constraining) for details.

### Using DPoP in your own requests

You use a DPoP token the same way as a "traditional" access token, except it must be sent to the server with an `Authorization: DPoP <token>` header instead of the usual `Authorization: Bearer <token>`.

For internal requests sent by `auth0-vue` to Auth0, simply enable the `useDpop` option and **every interaction with Auth0 will be protected**.

However, **to use DPoP with a custom, external API, some additional work is required**. The SDK provides some low-level methods to help with this:

- `getDpopNonce()`
- `setDpopNonce()`
- `generateDpopProof()`

However, due to the nature of how DPoP works, **this is not a trivial task**:

- When a nonce is missing or expired, the request may need to be retried.
- Received nonces must be stored and managed.
- DPoP headers must be generated and included in every request, and regenerated for retries.

Because of this, we recommend using the provided `createFetcher()` method with `fetchWithAuth()`, which **handles all of this for you**.

#### Simple usage

The `fetchWithAuth()` method is a drop-in replacement for the native `fetch()` function from the Fetch API, so if you're already using it, the change will be minimal.

For example, if you had this code:

```js
const response = await fetch('https://api.example.com/foo', {
  method: 'GET',
  headers: { 'user-agent': 'My Client 1.0' },
});

console.log(response.status);
console.log(response.headers);
console.log(await response.json());
```

You would change it as follows:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      return {
        fetchData: async () => {
          const fetcher = createFetcher({
            dpopNonceId: 'my_api_request',
          });

          const response = await fetcher.fetchWithAuth('https://api.example.com/foo', {
            method: 'GET',
            headers: { 'user-agent': 'My Client 1.0' },
          });

          console.log(response.status);
          console.log(response.headers);
          console.log(await response.json());
        },
      };
    },
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    methods: {
      async fetchData() {
        const fetcher = this.$auth0.createFetcher({
          dpopNonceId: 'my_api_request',
        });

        const response = await fetcher.fetchWithAuth('https://api.example.com/foo', {
          method: 'GET',
          headers: { 'user-agent': 'My Client 1.0' },
        });

        console.log(response.status);
        console.log(response.headers);
        console.log(await response.json());
      },
    },
  };
</script>
```

</details>

When using `fetchWithAuth()`, the following will be handled for you automatically:

- Use `getAccessTokenSilently()` to get the access token to inject in the headers.
- Generate and inject DPoP headers when needed.
- Store and update any DPoP nonces.
- Handle retries caused by a rejected nonce.

> [!IMPORTANT]
> If DPoP is enabled, a `dpopNonceId` **must** be present in the `createFetcher()` parameters, since it's used to keep track of the DPoP nonces for each request.

#### Advanced usage

If you need something more complex than the example above, you can provide a custom implementation in the `fetch` property.

However, since `auth0-vue` needs to make decisions based on HTTP responses, your implementation **must return an object with _at least_ two properties**:

1. `status`: the response status code as a number.
2. `headers`: the response headers as a plain object or as a Fetch API's Headers-like interface.

Whatever it returns, it will be passed as the output of the `fetchWithAuth()` method.

Your implementation will be called with a standard, ready-to-use [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object, which will contain any headers needed for authorization and DPoP usage (if enabled). Depending on your needs, you can use this object directly or treat it as a container with everything required to make the request your own way.

##### Having a base URL

If you need to make requests to different endpoints of the same API, passing a `baseUrl` to `createFetcher()` can be useful:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      const fetcher = createFetcher({
        dpopNonceId: 'my-api',
        baseUrl: 'https://api.example.com',
      });

      return {
        getFoo: async () => fetcher.fetchWithAuth('/foo'), // => https://api.example.com/foo
        getBar: async () => fetcher.fetchWithAuth('/bar'), // => https://api.example.com/bar
        getXyz: async () => fetcher.fetchWithAuth('/xyz'), // => https://api.example.com/xyz

        // If the passed URL is absolute, `baseUrl` will be ignored for convenience:
        getFromOtherApi: async () => fetcher.fetchWithAuth('https://other-api.example.com/foo'),
      };
    },
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    data() {
      return {
        fetcher: this.$auth0.createFetcher({
          dpopNonceId: 'my-api',
          baseUrl: 'https://api.example.com',
        }),
      };
    },
    methods: {
      async getFoo() {
        return this.fetcher.fetchWithAuth('/foo'); // => https://api.example.com/foo
      },
      async getBar() {
        return this.fetcher.fetchWithAuth('/bar'); // => https://api.example.com/bar
      },
      async getXyz() {
        return this.fetcher.fetchWithAuth('/xyz'); // => https://api.example.com/xyz
      },
      async getFromOtherApi() {
        // If the passed URL is absolute, `baseUrl` will be ignored for convenience:
        return this.fetcher.fetchWithAuth('https://other-api.example.com/foo');
      },
    },
  };
</script>
```

</details>

##### Multiple API endpoints

When working with multiple APIs, create separate fetchers for each. Each fetcher manages its own nonces independently:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      // Create separate fetchers for different APIs
      const internalApi = createFetcher({
        dpopNonceId: 'internal-api',
        baseUrl: 'https://internal.example.com',
      });

      const partnerApi = createFetcher({
        dpopNonceId: 'partner-api',
        baseUrl: 'https://partner.example.com',
      });

      return {
        fetchInternalData: async () => {
          const response = await internalApi.fetchWithAuth('/data');
          return response.json();
        },
        fetchPartnerData: async () => {
          const response = await partnerApi.fetchWithAuth('/resources');
          return response.json();
        },
        fetchAllData: async () => {
          const [internal, partner] = await Promise.all([
            internalApi.fetchWithAuth('/data'),
            partnerApi.fetchWithAuth('/resources'),
          ]);
          return {
            internal: await internal.json(),
            partner: await partner.json(),
          };
        },
      };
    },
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    data() {
      return {
        internalApi: this.$auth0.createFetcher({
          dpopNonceId: 'internal-api',
          baseUrl: 'https://internal.example.com',
        }),
        partnerApi: this.$auth0.createFetcher({
          dpopNonceId: 'partner-api',
          baseUrl: 'https://partner.example.com',
        }),
      };
    },
    methods: {
      async fetchInternalData() {
        const response = await this.internalApi.fetchWithAuth('/data');
        return response.json();
      },
      async fetchPartnerData() {
        const response = await this.partnerApi.fetchWithAuth('/resources');
        return response.json();
      },
      async fetchAllData() {
        const [internal, partner] = await Promise.all([
          this.internalApi.fetchWithAuth('/data'),
          this.partnerApi.fetchWithAuth('/resources'),
        ]);
        return {
          internal: await internal.json(),
          partner: await partner.json(),
        };
      },
    },
  };
</script>
```

</details>

##### POST/PUT/DELETE requests

The fetcher supports all HTTP methods and automatically includes DPoP proofs:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      const fetcher = createFetcher({
        dpopNonceId: 'my-api',
        baseUrl: 'https://api.example.com',
      });

      return {
        createPost: async (postData) => {
          const response = await fetcher.fetchWithAuth('/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
          });
          return response.json();
        },
        updatePost: async (postId, postData) => {
          const response = await fetcher.fetchWithAuth(`/posts/${postId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
          });
          return response.json();
        },
        deletePost: async (postId) => {
          await fetcher.fetchWithAuth(`/posts/${postId}`, {
            method: 'DELETE',
          });
        },
      };
    },
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    data() {
      return {
        fetcher: this.$auth0.createFetcher({
          dpopNonceId: 'my-api',
          baseUrl: 'https://api.example.com',
        }),
      };
    },
    methods: {
      async createPost(postData) {
        const response = await this.fetcher.fetchWithAuth('/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });
        return response.json();
      },
      async updatePost(postId, postData) {
        const response = await this.fetcher.fetchWithAuth(`/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });
        return response.json();
      },
      async deletePost(postId) {
        await this.fetcher.fetchWithAuth(`/posts/${postId}`, {
          method: 'DELETE',
        });
      },
    },
  };
</script>
```

</details>

##### Manual DPoP management

For scenarios requiring full control over DPoP proof generation and nonce management, you can use the low-level methods:

```html
<script>
  import { useAuth0, UseDpopNonceError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { getAccessTokenSilently, getDpopNonce, setDpopNonce, generateDpopProof } = useAuth0();

      return {
        manualDpopRequest: async () => {
          try {
            // 1. Get access token
            const token = await getAccessTokenSilently();

            // 2. Get DPoP nonce for the API
            const nonce = await getDpopNonce('my-api');

            // 3. Generate DPoP proof
            const proof = await generateDpopProof({
              url: 'https://api.example.com/data',
              method: 'POST',
              accessToken: token,
              nonce,
            });

            // 4. Make request with DPoP headers
            const response = await fetch('https://api.example.com/data', {
              method: 'POST',
              headers: {
                Authorization: `DPoP ${token}`,
                DPoP: proof,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ data: 'example' }),
            });

            // 5. Update nonce if server provides a new one
            const newNonce = response.headers.get('DPoP-Nonce');
            if (newNonce) {
              await setDpopNonce(newNonce, 'my-api');
            }

            return response.json();
          } catch (error) {
            if (error instanceof UseDpopNonceError) {
              console.error('DPoP nonce validation failed:', error.message);
            }
            throw error;
          }
        },
      };
    },
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  import { UseDpopNonceError } from '@auth0/auth0-vue';

  export default {
    methods: {
      async manualDpopRequest() {
        try {
          // 1. Get access token
          const token = await this.$auth0.getAccessTokenSilently();

          // 2. Get DPoP nonce for the API
          const nonce = await this.$auth0.getDpopNonce('my-api');

          // 3. Generate DPoP proof
          const proof = await this.$auth0.generateDpopProof({
            url: 'https://api.example.com/data',
            method: 'POST',
            accessToken: token,
            nonce,
          });

          // 4. Make request with DPoP headers
          const response = await fetch('https://api.example.com/data', {
            method: 'POST',
            headers: {
              Authorization: `DPoP ${token}`,
              DPoP: proof,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: 'example' }),
          });

          // 5. Update nonce if server provides a new one
          const newNonce = response.headers.get('DPoP-Nonce');
          if (newNonce) {
            await this.$auth0.setDpopNonce(newNonce, 'my-api');
          }

          return response.json();
        } catch (error) {
          if (error instanceof UseDpopNonceError) {
            console.error('DPoP nonce validation failed:', error.message);
          }
          throw error;
        }
      },
    },
  };
</script>
```

</details>

## Online Access (Online Refresh Tokens)

> [!NOTE]
> Online Access (Online Refresh Tokens) support via SDKs is currently in Early Access. To request access to this feature, contact your Auth0 representative.

**Online Refresh Tokens (ORTs)** are a refresh token type bound to the lifetime of the user's Auth0 session, unlike rotating offline refresh tokens. An ORT is:

- **Session-bound** — valid only while the underlying Auth0 session is active. When the session ends (logout, idle/absolute session expiry, or an admin revoking the session), the ORT stops working.
- **Non-rotating** — refreshing an access token with an ORT does **not** issue a new refresh token; the same ORT is reused for the life of the session.

Read more about [Online Refresh Tokens](https://auth0.com/docs/secure/tokens/refresh-tokens/online-refresh-tokens/online-refresh-tokens) to decide whether this fits your application.

> [!IMPORTANT]
> Online access requires DPoP. Sender-constraining the token via [DPoP](#device-bound-tokens-with-dpop) is mandatory because the ORT is non-rotating — binding it to the browser's key pair is what mitigates token replay if it is exfiltrated. You must set `useDpop: true` explicitly; the SDK does not enable it for you.
>
> This also requires the `online_refresh_tokens` flag to be enabled for your Auth0 tenant, and `allow_online_access` to be enabled on the resource server you log in with (on by default).

### Enabling Online Access

Set `refreshTokenMode` to `RefreshTokenMode.Online` together with `useRefreshTokens: true` and `useDpop: true`:

```js
import { createAuth0, RefreshTokenMode } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    useRefreshTokens: true, // required — online access is a refresh-token grant
    refreshTokenMode: RefreshTokenMode.Online, // 👈
    useDpop: true, // required — DPoP is mandatory for online access
    authorizationParams: {
      redirect_uri: '<MY_CALLBACK_URL>',
    },
  })
);

app.mount('#app');
```

`refreshTokenMode` defaults to `RefreshTokenMode.Offline` (rotating refresh tokens). Enabling online mode causes the underlying SDK to:

- Send the `online_access` scope to the authorization server (instead of `offline_access`) — you do **not** need to add it to `authorizationParams.scope` yourself.
- Route token renewal through the `refresh_token` grant against `/oauth/token` rather than a hidden iframe.
- Store the non-rotating ORT in the existing cache and reuse it on every refresh, never replacing it.

### Configuration validation

If `refreshTokenMode: RefreshTokenMode.Online` is set without `useRefreshTokens: true` and `useDpop: true`, the underlying `Auth0Client` constructor throws an `InvalidConfigurationError`:

```js
import { InvalidConfigurationError } from '@auth0/auth0-vue';

try {
  app.use(
    createAuth0({
      domain: '<AUTH0_DOMAIN>',
      clientId: '<AUTH0_CLIENT_ID>',
      refreshTokenMode: RefreshTokenMode.Online,
      useRefreshTokens: true, // missing useDpop: true
    })
  );
} catch (e) {
  if (e instanceof InvalidConfigurationError) {
    console.error(e.error_description); // includes the suggested fix
  }
}
```

### Using Online Access with MRRT

Online access is compatible with Multi-Resource Refresh Tokens (MRRT): a single ORT can be exchanged for access tokens across the audiences allowed by your refresh-token policies. The ORT remains non-rotating throughout.

```js
app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    useRefreshTokens: true,
    refreshTokenMode: RefreshTokenMode.Online,
    useDpop: true,
    useMrrt: true, // 👈
    authorizationParams: {
      redirect_uri: '<MY_CALLBACK_URL>',
      audience: 'https://api.example.com',
    },
  })
);
```

> [!IMPORTANT]
> In order for MRRT to work, it needs a previous configuration setting the refresh token policies.
> Visit [configure and implement MRRT](https://auth0.com/docs/secure/tokens/refresh-tokens/multi-resource-refresh-token/configure-and-implement-multi-resource-refresh-token).

## Multi-Factor Authentication (MFA)

The `mfa` property on the object returned by `useAuth0` gives access to all MFA operations. MFA flows are triggered when `getAccessTokenSilently` throws a `MfaRequiredError`.

> **Prerequisites:** MFA requires refresh token rotation to be enabled in the Auth0 client configuration (`useRefreshTokens: true`).

### Setup

Configure your Auth0 client with refresh tokens:

```js
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    authorizationParams: {
      redirect_uri: window.location.origin
    },
    useRefreshTokens: true
  })
);
```

### Handling the MFA Required Error

When `getAccessTokenSilently` results in an MFA requirement, it throws `MfaRequiredError`. Check `mfa_requirements.enroll` first — if it is non-empty the user must enroll a new factor before they can authenticate; otherwise proceed with a challenge against an existing authenticator:

```html
<script>
  import { useAuth0, MfaRequiredError } from '@auth0/auth0-vue';
  import { ref } from 'vue';

  export default {
    setup() {
      const { getAccessTokenSilently, mfa } = useAuth0();
      const mfaToken = ref(null);

      const fetchToken = async () => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: { audience: 'https://api.example.com' }
          });
          console.log('Access token:', token);
        } catch (e) {
          if (e instanceof MfaRequiredError) {
            mfaToken.value = e.mfa_token;

            if (e.mfa_requirements?.enroll?.length) {
              // User has no authenticators yet — show enrollment UI
              const factors = await mfa.getEnrollmentFactors(e.mfa_token);
              // present factors to the user (see Enrollment Flow below)
            } else {
              // User is already enrolled — show challenge UI
              const authenticators = await mfa.getAuthenticators(e.mfa_token);
              // present authenticators to the user (see Challenge Flow below)
            }
          }
        }
      };

      return { fetchToken, mfaToken };
    }
  };
</script>
```

### Challenge Flow

Use the challenge flow when the user already has an enrolled authenticator.

> **Note:** `mfa.verify()` returns raw tokens but does **not** automatically update Vue's reactive state (`isAuthenticated`, `user`, `idTokenClaims`). Call `checkSession()` after a successful `verify()` to refresh the auth state in your components.

#### OTP (TOTP / Authenticator App)

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { ref } from 'vue';

  export default {
    setup() {
      const { mfa, checkSession } = useAuth0();
      const otpCode = ref('');

      const verifyOtp = async (mfaToken) => {
        // For OTP, no challenge call is required — the user enters
        // the code directly from their authenticator app.
        await mfa.verify({
          mfaToken,
          otp: otpCode.value
        });
        // Refresh Vue reactive state (isAuthenticated, user, etc.)
        await checkSession();
      };

      return { otpCode, verifyOtp };
    }
  };
</script>
```

#### SMS / Email OTP

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { ref } from 'vue';

  export default {
    setup() {
      const { mfa, checkSession } = useAuth0();
      const bindingCode = ref('');
      const oobCode = ref('');

      const sendChallenge = async (mfaToken, authenticatorId) => {
        const challenge = await mfa.challenge({
          mfaToken,
          challengeType: 'oob',
          authenticatorId
        });
        oobCode.value = challenge.oobCode;
      };

      const verifyOob = async (mfaToken) => {
        await mfa.verify({
          mfaToken,
          oobCode: oobCode.value,
          bindingCode: bindingCode.value
        });
        // Refresh Vue reactive state (isAuthenticated, user, etc.)
        await checkSession();
      };

      return { bindingCode, oobCode, sendChallenge, verifyOob };
    }
  };
</script>
```

#### Recovery Code

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { ref } from 'vue';

  export default {
    setup() {
      const { mfa, checkSession } = useAuth0();
      const recoveryCode = ref('');

      const verifyRecoveryCode = async (mfaToken) => {
        const tokens = await mfa.verify({
          mfaToken,
          recoveryCode: recoveryCode.value
        });
        // Auth0 rotates the recovery code on use — save the replacement or the
        // user will be locked out if they need to fall back again.
        if (tokens.recovery_code) {
          console.warn('Save your new recovery code:', tokens.recovery_code);
        }
        // Refresh Vue reactive state (isAuthenticated, user, etc.)
        await checkSession();
      };

      return { recoveryCode, verifyRecoveryCode };
    }
  };
</script>
```

### Enrollment Flow

Use the enrollment flow when the user has no authenticators yet. Call `getEnrollmentFactors` to discover what they can enroll in.

#### Discover Enrollment Options

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { ref } from 'vue';

  export default {
    setup() {
      const { mfa } = useAuth0();
      const enrollmentFactors = ref([]);

      const loadEnrollmentOptions = async (mfaToken) => {
        enrollmentFactors.value = await mfa.getEnrollmentFactors(mfaToken);
        // e.g. [{ type: 'otp' }, { type: 'phone' }, { type: 'push-notification' }]
      };

      return { enrollmentFactors, loadEnrollmentOptions };
    }
  };
</script>
```

#### Enroll TOTP

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { ref } from 'vue';

  export default {
    setup() {
      const { mfa } = useAuth0();
      const barcodeUri = ref('');
      const secret = ref('');

      const enrollTotp = async (mfaToken) => {
        const enrollment = await mfa.enroll({
          mfaToken,
          factorType: 'otp'
        });
        barcodeUri.value = enrollment.barcodeUri; // Render as QR code
        secret.value = enrollment.secret;         // Show as manual entry fallback
      };

      return { barcodeUri, secret, enrollTotp };
    }
  };
</script>
```

#### Enroll SMS

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { mfa } = useAuth0();

      const enrollSms = async (mfaToken, phoneNumber) => {
        await mfa.enroll({
          mfaToken,
          factorType: 'sms',
          phoneNumber // E.164 format, e.g. '+12025551234'
        });
        // An OOB code is sent via SMS — prompt the user to enter it
      };

      return { enrollSms };
    }
  };
</script>
```

### Error Handling

The `mfa` client throws typed errors for each operation:

```html
<script>
  import {
    useAuth0,
    MfaRequiredError,
    MfaListAuthenticatorsError,
    MfaEnrollmentError,
    MfaChallengeError,
    MfaVerifyError,
    MfaEnrollmentFactorsError
  } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { getAccessTokenSilently, mfa } = useAuth0();

      const handleMfaFlow = async () => {
        try {
          await getAccessTokenSilently();
        } catch (e) {
          if (!(e instanceof MfaRequiredError)) throw e;

          try {
            const authenticators = await mfa.getAuthenticators(e.mfa_token);
            // ... drive challenge/enrollment UI
          } catch (mfaError) {
            if (mfaError instanceof MfaListAuthenticatorsError) {
              console.error('Failed to list authenticators:', mfaError.error_description);
            } else if (mfaError instanceof MfaVerifyError) {
              console.error('Verification failed:', mfaError.error_description);
            } else if (mfaError instanceof MfaEnrollmentError) {
              console.error('Enrollment failed:', mfaError.error_description);
            } else if (mfaError instanceof MfaChallengeError) {
              console.error('Challenge failed:', mfaError.error_description);
            } else if (mfaError instanceof MfaEnrollmentFactorsError) {
              console.error('Failed to retrieve enrollment factors:', mfaError.error_description);
            }
          }
        }
      };

      return { handleMfaFlow };
    }
  };
</script>
```

### Options API

All MFA operations are also available via the Options API using `this.$auth0.mfa`:

```html
<script>
  import { MfaRequiredError } from '@auth0/auth0-vue';

  export default {
    data() {
      return {
        mfaToken: null,
        authenticators: []
      };
    },
    methods: {
      async fetchToken() {
        try {
          await this.$auth0.getAccessTokenSilently({
            authorizationParams: { audience: 'https://api.example.com' }
          });
        } catch (e) {
          if (e instanceof MfaRequiredError) {
            this.mfaToken = e.mfa_token;
            if (e.mfa_requirements?.enroll?.length) {
              // User needs to enroll — show enrollment UI
            } else {
              // User is already enrolled — show challenge UI
              this.authenticators = await this.$auth0.mfa.getAuthenticators(e.mfa_token);
            }
          }
        }
      },
      async verifyOtp(otpCode) {
        await this.$auth0.mfa.verify({
          mfaToken: this.mfaToken,
          otp: otpCode
        });
        // Refresh Vue reactive state (isAuthenticated, user, etc.)
        await this.$auth0.checkSession();
      }
    }
  };
</script>
```

## Step-Up Authentication

Step-Up Authentication is an alternative to building a custom MFA UI. When `interactiveErrorHandler: 'popup'` is configured, `getAccessTokenSilently()` automatically handles any `mfa_required` error by opening a Universal Login popup for the user to complete MFA — the token is then returned transparently with no extra code needed in your components.

### Setup

```js
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: '<AUTH0_DOMAIN>',
    clientId: '<AUTH0_CLIENT_ID>',
    authorizationParams: {
      redirect_uri: window.location.origin
    },
    useRefreshTokens: true,
    interactiveErrorHandler: 'popup'
  })
);
```

### Usage

With `interactiveErrorHandler: 'popup'` set, no special error handling is needed. If Auth0 requires MFA, the SDK opens Universal Login in a popup automatically:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { getAccessTokenSilently } = useAuth0();

      const fetchToken = async () => {
        // If MFA is required, the SDK opens a popup automatically.
        // The token is returned once the user completes authentication.
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: 'https://api.example.com' }
        });
        console.log('Access token:', token);
      };

      return { fetchToken };
    }
  };
</script>
```

If there is a problem with the popup, `getAccessTokenSilently` will throw one of `PopupOpenError`, `PopupCancelledError`, or `PopupTimeoutError`.

## Custom Token Exchange

Exchange an external token for Auth0 tokens using the Custom Token Exchange grant ([RFC 8693](https://www.rfc-editor.org/rfc/rfc8693)). This establishes a full Auth0 session — after a successful exchange, `isAuthenticated` will be `true` and `user` will be populated.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithCustomTokenExchange, isAuthenticated, user } = useAuth0();

      const exchangeToken = async (externalToken) => {
        try {
          await loginWithCustomTokenExchange({
            subject_token: externalToken,
            subject_token_type: 'urn:your-company:legacy-system-token',
            audience: 'https://api.example.com/',
            scope: 'openid profile email'
          });
        } catch (e) {
          console.error('Token exchange failed:', e);
        }
      };

      return { exchangeToken, isAuthenticated, user };
    }
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    methods: {
      async exchangeToken(externalToken) {
        try {
          await this.$auth0.loginWithCustomTokenExchange({
            subject_token: externalToken,
            subject_token_type: 'urn:your-company:legacy-system-token',
            audience: 'https://api.example.com/',
            scope: 'openid profile email'
          });
        } catch (e) {
          console.error('Token exchange failed:', e);
        }
      }
    }
  };
</script>
```

</details>

**Notes:**
- `subject_token_type` must be a namespaced URI under your organization's control. Well-known prefixes such as `urn:ietf:params:oauth:*`, `urn:auth0:*`, and `https://auth0.com/*` are reserved and should not be used for custom token types. See the [Auth0 Custom Token Exchange documentation](https://auth0.com/docs/authenticate/login/custom-token-exchange) for details.
- The external token must be validated in an Auth0 Action using strong cryptographic verification.
- `audience` and `scope` fall back to the SDK's configured defaults if not provided.

## Passkeys

Passkeys provide password-less authentication using platform biometrics (Face ID, Touch ID, Windows Hello) or security keys via the WebAuthn standard. The SDK supports two flows:

- **Signup**: Register a new user with a passkey
- **Login**: Authenticate an existing user with a passkey

- [Setup](#setup-1)
- [Important: Use Refresh Tokens with Passkeys](#important-use-refresh-tokens-with-passkeys)
- [Signup with Passkey](#signup-with-passkey)
- [Login with Passkey](#login-with-passkey)
- [Complete Passkey Flow Example](#complete-passkey-flow-example)
- [Passkey Error Handling](#passkey-error-handling)

### Setup

Before using passkeys, ensure the following are configured in your [Auth0 Dashboard](https://manage.auth0.com):

1. **Enable passkey authentication method**: Go to **Authentication** > **Database** > your connection > **Authentication Methods** > **Passkey**.
2. **Enable the WebAuthn passkey grant**: Go to your **Application** > **Advanced Settings** > **Grant Types** and enable the **Passkey** grant.
3. **Custom domain required**: Passkeys are bound to an origin (domain). A [custom domain](https://auth0.com/docs/customize/custom-domains) must be configured — passkeys will not work on the default `*.auth0.com` domain.

### Important: Use Refresh Tokens with Passkeys

> **Important:** When using passkeys, you **must** configure `createAuth0` with `useRefreshTokens: true`.

Passkey authentication uses a direct token exchange (`/oauth/token` with the WebAuthn grant type) and does **not** create an Auth0 session cookie. Without refresh tokens, `getAccessTokenSilently()` will fail with `login_required` when the access token expires — or worse, silently return tokens for a different user if a prior redirect-based session cookie exists.

```js
// main.js
import { createApp } from 'vue';
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: 'YOUR_AUTH0_DOMAIN',
    clientId: 'YOUR_AUTH0_CLIENT_ID',
    useRefreshTokens: true, // Required for passkey-based sessions
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);
```

It is also recommended to enable **Refresh Token Rotation** in your Auth0 Dashboard under **Applications** > your app > **Settings** > **Refresh Token Rotation**.

### Signup with Passkey

Register a new user with a passkey. The SDK handles the entire flow internally — requesting a challenge from Auth0, triggering the browser's WebAuthn credential creation ceremony, and exchanging the credential for tokens. After a successful call, `isAuthenticated`, `user`, and `getAccessTokenSilently()` all work as expected.

At least one user identifier (`email`, `phoneNumber`, or `username`) is required. Which identifiers are accepted depends on what is configured on your database connection.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { passkey } = useAuth0();

      const signupWithPasskey = async () => {
        await passkey.signup({
          email: 'user@example.com' // required — at least one of: email, phoneNumber, username
        });
      };

      return { signupWithPasskey };
    }
  };
</script>
```

All supported options:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { passkey } = useAuth0();

      const signupWithPasskey = async () => {
        await passkey.signup({
          // Identifiers — at least one required
          email: 'user@example.com',
          phoneNumber: '+15551234567', // E.164 format
          username: 'janedoe',

          // Profile fields — all optional
          name: 'Jane Doe',           // display name
          givenName: 'Jane',
          familyName: 'Doe',
          nickname: 'janie',
          picture: 'https://example.com/avatar.png',
          userMetadata: { plan: 'pro' }, // stored in user_metadata on the Auth0 user

          // Context — optional
          realm: 'Username-Password-Authentication', // database connection name
          organization: 'org_abc123',

          // Token control — optional
          scope: 'openid profile email read:products',
          audience: 'https://api.example.com'
        });
      };

      return { signupWithPasskey };
    }
  };
</script>
```

### Login with Passkey

Authenticate an existing user with their registered passkey. A single call handles the entire assertion flow.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { passkey } = useAuth0();

      const loginWithPasskey = async () => {
        await passkey.login();
        // Or with optional params:
        // await passkey.login({ realm, organization, scope, audience });
      };

      return { loginWithPasskey };
    }
  };
</script>
```

### Complete Passkey Flow Example

```html
<template>
  <div v-if="isAuthenticated">
    <p>Welcome, {{ user.name }}!</p>
  </div>
  <div v-else>
    <button @click="handleSignup">Sign up with Passkey</button>
    <button @click="handleLogin">Sign in with Passkey</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import { useAuth0, PasskeyError, PasskeyRegisterError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { passkey, isAuthenticated, user } = useAuth0();
      const errorMessage = ref('');

      const handleSignup = async () => {
        try {
          await passkey.signup({ email: 'user@example.com' });
          // isAuthenticated and user are now updated automatically
        } catch (error) {
          if (error instanceof PasskeyRegisterError) {
            errorMessage.value = `Registration failed: ${error.message}`;
          } else if (error instanceof PasskeyError) {
            errorMessage.value = `Passkey error: ${error.message}`;
          }
        }
      };

      const handleLogin = async () => {
        try {
          await passkey.login();
          // isAuthenticated and user are now updated automatically
        } catch (error) {
          if (error instanceof PasskeyError) {
            errorMessage.value = `Passkey error: ${error.message}`;
          }
        }
      };

      return { isAuthenticated, user, errorMessage, handleSignup, handleLogin };
    }
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  import { PasskeyError, PasskeyRegisterError } from '@auth0/auth0-vue';

  export default {
    data() {
      return { errorMessage: '' };
    },
    methods: {
      async handleSignup() {
        try {
          await this.$auth0.passkey.signup({ email: 'user@example.com' });
        } catch (error) {
          if (error instanceof PasskeyRegisterError) {
            this.errorMessage = `Registration failed: ${error.message}`;
          } else if (error instanceof PasskeyError) {
            this.errorMessage = `Passkey error: ${error.message}`;
          }
        }
      },
      async handleLogin() {
        try {
          await this.$auth0.passkey.login();
        } catch (error) {
          if (error instanceof PasskeyError) {
            this.errorMessage = `Passkey error: ${error.message}`;
          }
        }
      }
    }
  };
</script>
```

</details>

### Passkey Error Handling

Both `signup()` and `login()` throw typed errors for precise error handling:

```html
<script>
  import { useAuth0, PasskeyError, PasskeyRegisterError, PasskeyChallengeError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { passkey } = useAuth0();

      const signupWithPasskey = async () => {
        try {
          await passkey.signup({ email: 'user@example.com' });
        } catch (error) {
          if (error instanceof PasskeyRegisterError) {
            // Registration ceremony failed (e.g. user cancelled biometric prompt)
            console.error('Registration failed:', error.message);
          } else if (error instanceof PasskeyChallengeError) {
            // Could not obtain the WebAuthn challenge from Auth0
            console.error('Challenge error:', error.message);
          } else if (error instanceof PasskeyError) {
            // General passkey error
            console.error('Passkey error:', error.message);
          }
        }
      };

      const loginWithPasskey = async () => {
        try {
          await passkey.login();
        } catch (error) {
          if (error instanceof PasskeyError) {
            console.error('Login failed:', error.message);
          }
        }
      };

      return { signupWithPasskey, loginWithPasskey };
    }
  };
</script>
```

If your tenant requires MFA after a passkey login, `passkey.login()` will throw an `MfaRequiredError`. Handle it using the MFA API:

```html
<script>
  import { useAuth0, PasskeyError, MfaRequiredError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { passkey, mfa } = useAuth0();

      const loginWithPasskey = async () => {
        try {
          await passkey.login();
        } catch (error) {
          if (error instanceof MfaRequiredError) {
            // MFA step-up required — proceed with the MFA API
            const mfaToken = error.mfa_token;
            const authenticators = await mfa.getAuthenticators(mfaToken);
            // continue with challenge/verify flow — see the MFA section for full examples
          } else if (error instanceof PasskeyError) {
            console.error('Login failed:', error.message);
          }
        }
      };

      return { loginWithPasskey };
    }
  };
</script>
```

> **Tip:** Both `signup()` and `login()` throw an error if the user cancels the biometric prompt. Wrap calls in `try/catch` to handle cancellation, network failures, or misconfigured connections.

## MyAccount API

The MyAccount API lets you manage the current user's authentication methods, factors, and connected accounts directly from your Vue application.

> **Note:** The MyAccount API requires the MyAccount audience (`https://{your-domain}/me/`) and the corresponding scopes in your `authorizationParams`. If your app uses a custom API audience alongside MyAccount, you will also need refresh tokens and MRRT.

- [Setup](#setup-2)
- [Factors](#factors)
- [Authentication Methods](#authentication-methods)
- [Enrollment](#enrollment)
- [MyAccount Error Handling](#myaccount-error-handling)

### Setup

Configure your Auth0 client with the MyAccount audience and required scopes:

```js
// main.js
import { createApp } from 'vue';
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: 'YOUR_AUTH0_DOMAIN',
    clientId: 'YOUR_AUTH0_CLIENT_ID',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: 'https://YOUR_AUTH0_DOMAIN/me/',
      scope: 'openid profile email read:me:factors read:me:authentication_methods create:me:authentication_methods update:me:authentication_methods delete:me:authentication_methods'
    }
  })
);
```

### Factors

Get the list of MFA factors and their enabled status for the current user.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const loadFactors = async () => {
        const factors = await myAccount.getFactors();
        // [{ type: 'totp', usage: ['secondary'] }, ...]
        console.log(factors);
      };

      return { loadFactors };
    }
  };
</script>
```

### Authentication Methods

#### List all authentication methods

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const loadMethods = async () => {
        const methods = await myAccount.getAuthenticationMethods();
        console.log(methods);
      };

      return { loadMethods };
    }
  };
</script>
```

#### Get a single authentication method by ID

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const loadMethod = async (methodId) => {
        const method = await myAccount.getAuthenticationMethod(methodId);
        console.log(method);
      };

      return { loadMethod };
    }
  };
</script>
```

#### Update an authentication method

Rename a `totp` or `push-notification` method using the `name` field. For `phone` methods, update the preferred delivery channel using `preferred_authentication_method`.

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      // Rename a totp or push-notification method
      const renameMethod = async (methodId) => {
        const updated = await myAccount.updateAuthenticationMethod(methodId, {
          name: 'My Authenticator App'
        });
        console.log(updated);
      };

      // Update preferred delivery channel for a phone method
      const updatePhoneMethod = async (methodId) => {
        const updated = await myAccount.updateAuthenticationMethod(methodId, {
          preferred_authentication_method: 'voice' // 'sms' | 'voice'
        });
        console.log(updated);
      };

      return { renameMethod, updatePhoneMethod };
    }
  };
</script>
```

#### Delete an authentication method

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const deleteMethod = async (methodId) => {
        await myAccount.deleteAuthenticationMethod(methodId);
      };

      return { deleteMethod };
    }
  };
</script>
```

### Enrollment

Enrollment is a two-step flow: request a challenge, then verify the credential.

#### Passkey

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const enrollPasskey = async () => {
        // Step 1: get the WebAuthn creation challenge
        const challenge = await myAccount.enrollmentChallenge({ type: 'passkey' });

        // Step 2: trigger the browser WebAuthn ceremony
        const credential = await navigator.credentials.create({
          publicKey: {
            ...challenge.authn_params_public_key,
            challenge: base64urlToBuffer(challenge.authn_params_public_key.challenge), // decode base64url → ArrayBuffer
            user: {
              ...challenge.authn_params_public_key.user,
              id: base64urlToBuffer(challenge.authn_params_public_key.user.id) // decode base64url → ArrayBuffer
            }
          }
        });

        // Step 3: verify and complete enrollment
        const method = await myAccount.enrollmentVerify({
          type: 'passkey',
          location: challenge.location,
          auth_session: challenge.auth_session,
          authn_response: serializeCredential(credential) // serialize PublicKeyCredential → plain object
        });

        console.log('Enrolled passkey:', method);
      };

      return { enrollPasskey };
    }
  };
</script>
```

> **Note:** The WebAuthn API requires binary buffers for `challenge` and `user.id`, and expects a plain serializable object when sending the credential back to Auth0. You will need two small helpers:
> - `base64urlToBuffer(str)` — converts a base64url string to `ArrayBuffer`. See [MDN: Base64 encoding and decoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64) or use a library such as [`@simplewebauthn/browser`](https://simplewebauthn.dev).
> - `serializeCredential(credential)` — converts the `PublicKeyCredential` returned by `navigator.credentials.create()` into a plain JSON-serializable object. Most WebAuthn libraries provide this out of the box.

#### Email

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const enrollEmail = async (email, otpCode) => {
        // Step 1: request OTP to the email address
        const challenge = await myAccount.enrollmentChallenge({
          type: 'email',
          email
        });

        // Step 2: verify with the OTP the user received
        await myAccount.enrollmentVerify({
          type: 'email',
          location: challenge.location,
          auth_session: challenge.auth_session,
          otp_code: otpCode
        });
      };

      return { enrollEmail };
    }
  };
</script>
```

#### Phone

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const enrollPhone = async (phoneNumber, otpCode) => {
        // Step 1: request OTP to the phone number
        const challenge = await myAccount.enrollmentChallenge({
          type: 'phone',
          phone_number: phoneNumber,
          preferred_authentication_method: 'sms'
        });

        // Step 2: verify with the OTP the user received
        await myAccount.enrollmentVerify({
          type: 'phone',
          location: challenge.location,
          auth_session: challenge.auth_session,
          otp_code: otpCode
        });
      };

      return { enrollPhone };
    }
  };
</script>
```

#### TOTP (Authenticator App)

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const enrollTotp = async (otpCode) => {
        // Step 1: get the TOTP secret and QR code URI
        const challenge = await myAccount.enrollmentChallenge({ type: 'totp' });
        // challenge.barcode_uri  — render as a QR code for the user to scan
        // challenge.manual_input_code — fallback manual entry code

        // Step 2: user scans QR code and enters the generated OTP to confirm
        await myAccount.enrollmentVerify({
          type: 'totp',
          location: challenge.location,
          auth_session: challenge.auth_session,
          otp_code: otpCode
        });
      };

      return { enrollTotp };
    }
  };
</script>
```

### MyAccount Error Handling

All MyAccount API errors throw `MyAccountApiError` with RFC 7807 fields.

```html
<script>
  import { useAuth0, MyAccountApiError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { myAccount } = useAuth0();

      const enrollPasskey = async () => {
        try {
          const challenge = await myAccount.enrollmentChallenge({ type: 'passkey' });
          // ... complete enrollment
        } catch (err) {
          if (err instanceof MyAccountApiError) {
            console.error(err.status, err.title, err.detail);
            if (err.validation_errors) {
              err.validation_errors.forEach(e => console.error(e.field, e.detail));
            }
          }
        }
      };

      const deleteMethod = async (methodId) => {
        try {
          await myAccount.deleteAuthenticationMethod(methodId);
        } catch (err) {
          if (err instanceof MyAccountApiError) {
            console.error(err.status, err.title, err.detail);
          }
        }
      };

      return { enrollPasskey, deleteMethod };
    }
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  import { MyAccountApiError } from '@auth0/auth0-vue';

  export default {
    methods: {
      async loadFactors() {
        try {
          const factors = await this.$auth0.myAccount.getFactors();
          console.log(factors);
        } catch (err) {
          if (err instanceof MyAccountApiError) {
            console.error(err.status, err.title, err.detail);
          }
        }
      },
      async enrollPasskey() {
        try {
          const challenge = await this.$auth0.myAccount.enrollmentChallenge({ type: 'passkey' });
          // ... complete enrollment
        } catch (err) {
          if (err instanceof MyAccountApiError) {
            console.error(err.status, err.title, err.detail);
          }
        }
      }
    }
  };
</script>
```

</details>
