import { createAuth0 } from '../src/index';

const defaultDomain = 'http://127.0.0.1:3000';
const defaultClientId = 'testing';
const defaultAudience = 'Test';

const res = JSON.parse(localStorage.getItem('vue-playground-data'));
const domain = res?.domain || defaultDomain;
const client_id = res?.client_id || defaultClientId;
const audience = res?.audience || defaultAudience;

export const auth0 = createAuth0({
  domain,
  client_id,
  audience,
  useFormData: res?.useFormData || true,
  redirect_uri: window.location.origin
});
