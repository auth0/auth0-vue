import { createApp } from 'vue';
import { createAuth0 } from '../src/index';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Playground from './App.vue';
import { createRouter } from './router';

const defaultDomain = 'http://127.0.0.1:3000';
const defaultClientId = 'testing';
const defaultAudience = 'Test';

const res = JSON.parse(localStorage.getItem('vue-playground-data'));
const domain = res?.domain || defaultDomain;
const client_id = res?.client_id || defaultClientId;
const audience = res?.audience || defaultAudience;

const app = createApp(Playground);
const router = createRouter(app, {
  domain,
  client_id,
  audience
});
app
  .use(
    createAuth0(
      {
        domain,
        client_id,
        audience,
        useFormData: res?.useFormData || true,
        redirect_uri: window.location.origin
      },
      { router }
    )
  )
  .use(router)
  .mount('#app');
