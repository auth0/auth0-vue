import { App } from 'vue';
import {
  createRouter as createVueRouter,
  createWebHashHistory
} from 'vue-router';
import { createAuthGuard } from '../src/guard';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Home from './components/Home.vue';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Profile from './components/Profile.vue';

export function createRouter(app: App) {
  return createVueRouter({
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
  });
}
