# Examples

1. [Protecting a route when using multiple Vue applications](#1-protecting-a-route-when-using-multiple-vue-applications)

## 1. Protecting a route when using multiple Vue applications

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
    client_id
  })
);
app.mount('#app');
```

Doing the above ensures every guard is connected to the Auth0Plugin that's configured in the same Vue application.
