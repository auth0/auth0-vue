import { createAuth0 } from '../src/index';

const defaultDomain = 'http://127.0.0.1:3000';
const defaultClientId = 'testing';
const defaultAudience = 'Test';

const res = localStorage.getItem('vue-playground-data')
  ? JSON.parse(localStorage.getItem('vue-playground-data') as string)
  : undefined;
const domain = res?.domain || defaultDomain;
const clientId = res?.client_id || defaultClientId;
const audience = res?.audience || defaultAudience;

export const auth0 = createAuth0(
  {
    domain,
    clientId,
    authorizationParams: {
      audience,
      redirect_uri: window.location.origin
    },
    useFormData: res?.useFormData || true
  },
  { errorPath: '/error' }
);
