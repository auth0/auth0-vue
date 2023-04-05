import { createRouter as createVueRouter, createWebHistory } from 'vue-router';
import { authGuard } from '../src/guard';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Home from './components/Home.vue';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Profile from './components/Profile.vue';
// @ts-ignore
import Error from './components/Error.vue';

export function createRouter({ client_id, domain, audience }: any) {
  return createVueRouter({
    linkActiveClass: 'btn-primary',
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
        props: {
          client_id,
          domain,
          audience
        }
      },
      {
        path: '/profile',
        name: 'profile',
        component: Profile,
        beforeEnter: authGuard
      },
      {
        path: '/error',
        name: 'error',
        component: Error
      }
    ],
    history: createWebHistory()
  });
}
