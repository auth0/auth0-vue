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
- [DPoP (Demonstrating Proof-of-Possession)](#dpop-demonstrating-proof-of-possession)

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

## DPoP (Demonstrating Proof-of-Possession)

[DPoP](https://datatracker.ietf.org/doc/html/rfc9449) is a security mechanism that cryptographically binds access tokens to the client that requested them, preventing token theft and replay attacks. When enabled, tokens are bound to a client's private key, making stolen tokens unusable by attackers.

### Benefits of DPoP

- **Token Theft Protection**: Stolen tokens cannot be used without the client's private key
- **Replay Attack Prevention**: Each request requires a unique cryptographic proof
- **Token Exfiltration Mitigation**: Tokens are useless without the corresponding private key

### Enabling DPoP

To enable DPoP support, set `useDpop: true` when configuring the plugin:

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
    },
    useDpop: true
  })
);

app.mount('#app');
```

### Using createFetcher (Recommended)

The simplest way to make DPoP-protected API calls is using `createFetcher()`, which automatically handles token retrieval, DPoP proof generation, and nonce management:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      return {
        fetchProtectedData: async () => {
          // Create a fetcher with automatic DPoP handling
          const fetcher = createFetcher({
            dpopNonceId: 'my-api',
            baseUrl: 'https://api.example.com'
          });

          // Make authenticated request with DPoP
          const response = await fetcher.fetchWithAuth('/protected-data');
          const data = await response.json();
          return data;
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
      async fetchProtectedData() {
        const fetcher = this.$auth0.createFetcher({
          dpopNonceId: 'my-api',
          baseUrl: 'https://api.example.com'
        });

        const response = await fetcher.fetchWithAuth('/protected-data');
        const data = await response.json();
        return data;
      }
    }
  };
</script>
```

</details>

### Multiple API Endpoints

When calling multiple APIs, create separate fetchers for each to manage nonces independently:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      // Create separate fetchers for different APIs
      const internalApi = createFetcher({
        dpopNonceId: 'internal-api',
        baseUrl: 'https://internal.example.com'
      });

      const partnerApi = createFetcher({
        dpopNonceId: 'partner-api',
        baseUrl: 'https://partner.example.com'
      });

      return {
        fetchInternalData: async () => {
          const response = await internalApi.fetchWithAuth('/data');
          return response.json();
        },
        fetchPartnerData: async () => {
          const response = await partnerApi.fetchWithAuth('/resources');
          return response.json();
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
    data() {
      return {
        internalApi: this.$auth0.createFetcher({
          dpopNonceId: 'internal-api',
          baseUrl: 'https://internal.example.com'
        }),
        partnerApi: this.$auth0.createFetcher({
          dpopNonceId: 'partner-api',
          baseUrl: 'https://partner.example.com'
        })
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
      }
    }
  };
</script>
```

</details>

### POST Requests with DPoP

The fetcher supports all HTTP methods and automatically includes DPoP proofs:

```html
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      const fetcher = createFetcher({
        dpopNonceId: 'my-api',
        baseUrl: 'https://api.example.com'
      });

      return {
        createPost: async postData => {
          const response = await fetcher.fetchWithAuth('/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
          });
          return response.json();
        },
        updatePost: async (postId, postData) => {
          const response = await fetcher.fetchWithAuth(`/posts/${postId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
          });
          return response.json();
        },
        deletePost: async postId => {
          await fetcher.fetchWithAuth(`/posts/${postId}`, {
            method: 'DELETE'
          });
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
    data() {
      return {
        fetcher: this.$auth0.createFetcher({
          dpopNonceId: 'my-api',
          baseUrl: 'https://api.example.com'
        })
      };
    },
    methods: {
      async createPost(postData) {
        const response = await this.fetcher.fetchWithAuth('/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });
        return response.json();
      },
      async updatePost(postId, postData) {
        const response = await this.fetcher.fetchWithAuth(`/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });
        return response.json();
      },
      async deletePost(postId) {
        await this.fetcher.fetchWithAuth(`/posts/${postId}`, {
          method: 'DELETE'
        });
      }
    }
  };
</script>
```

</details>

### DPoP Error Handling

Handle DPoP-specific errors using the `UseDpopNonceError` class:

```html
<script>
  import { useAuth0, UseDpopNonceError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { createFetcher } = useAuth0();

      const fetcher = createFetcher({
        dpopNonceId: 'my-api',
        baseUrl: 'https://api.example.com'
      });

      return {
        fetchData: async () => {
          try {
            const response = await fetcher.fetchWithAuth('/data');
            return response.json();
          } catch (error) {
            if (error instanceof UseDpopNonceError) {
              console.error('DPoP nonce error:', error.message);
              // Handle nonce-specific errors
            } else {
              console.error('Request failed:', error);
              // Handle other errors
            }
            throw error;
          }
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
  import { UseDpopNonceError } from '@auth0/auth0-vue';

  export default {
    data() {
      return {
        fetcher: this.$auth0.createFetcher({
          dpopNonceId: 'my-api',
          baseUrl: 'https://api.example.com'
        })
      };
    },
    methods: {
      async fetchData() {
        try {
          const response = await this.fetcher.fetchWithAuth('/data');
          return response.json();
        } catch (error) {
          if (error instanceof UseDpopNonceError) {
            console.error('DPoP nonce error:', error.message);
            // Handle nonce-specific errors
          } else {
            console.error('Request failed:', error);
            // Handle other errors
          }
          throw error;
        }
      }
    }
  };
</script>
```

</details>

### Advanced: Manual DPoP Management

For scenarios requiring full control over DPoP proof generation and nonce management:

```html
<script>
  import { useAuth0, UseDpopNonceError } from '@auth0/auth0-vue';

  export default {
    setup() {
      const {
        getAccessTokenSilently,
        getDpopNonce,
        setDpopNonce,
        generateDpopProof
      } = useAuth0();

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
              nonce
            });

            // 4. Make request with DPoP headers
            const response = await fetch('https://api.example.com/data', {
              method: 'POST',
              headers: {
                Authorization: `DPoP ${token}`,
                DPoP: proof,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ data: 'example' })
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
            nonce
          });

          // 4. Make request with DPoP headers
          const response = await fetch('https://api.example.com/data', {
            method: 'POST',
            headers: {
              Authorization: `DPoP ${token}`,
              DPoP: proof,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: 'example' })
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
      }
    }
  };
</script>
```

</details>
