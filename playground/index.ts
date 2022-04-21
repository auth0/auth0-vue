import { createApp } from 'vue';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Playground from './App.vue';
import { createRouter } from './router';
import { auth0 } from './auth0';

const defaultDomain = 'http://127.0.0.1:3000';
const defaultClientId = 'testing';
const defaultAudience = 'Test';

const res = JSON.parse(localStorage.getItem('vue-playground-data'));
const domain = res?.domain || defaultDomain;
const client_id = res?.client_id || defaultClientId;
const audience = res?.audience || defaultAudience;

createApp(Playground)
  .use(
    createRouter({
      domain,
      client_id,
      audience
    })
  )
  .use(auth0)
  .mount('#app');
