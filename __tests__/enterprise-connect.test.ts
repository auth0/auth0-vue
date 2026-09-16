import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// The spa-js module is mocked so the re-export chain resolves without a real
// network call. isFederatedDomain is given a controllable implementation so we
// can drive the federated / non-federated branches of the login handoff.
const isFederatedDomainMock = jest.fn<any>();
const loginWithRedirectMock = jest.fn<any>().mockResolvedValue(null);

jest.mock('@auth0/auth0-spa-js', () => ({
  __esModule: true,
  Auth0Client: jest.fn().mockImplementation(() => ({
    loginWithRedirect: loginWithRedirectMock
  })),
  isFederatedDomain: (...args: unknown[]) => isFederatedDomainMock(...args)
}));

import { isFederatedDomain } from '../src/index';

describe('Enterprise Connect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('re-exports isFederatedDomain as a callable function', () => {
    expect(typeof isFederatedDomain).toBe('function');
  });

  it('routes the email domain through isFederatedDomain', async () => {
    isFederatedDomainMock.mockResolvedValue(true);

    await isFederatedDomain('tenant.auth0.com', 'acme.com');

    expect(isFederatedDomainMock).toHaveBeenCalledWith(
      'tenant.auth0.com',
      'acme.com'
    );
  });

  it('hands off to the app fallback without login when the domain is not federated', async () => {
    isFederatedDomainMock.mockResolvedValue(false);

    // Mirrors the non-federated branch from the EXAMPLES.md login flow.
    const federated = await isFederatedDomain('tenant.auth0.com', 'gmail.com');

    expect(federated).toBe(false);
    expect(loginWithRedirectMock).not.toHaveBeenCalled();
  });

  it('forwards the email as login_hint on the federated path', async () => {
    isFederatedDomainMock.mockResolvedValue(true);

    const email = 'user@acme.com';
    const federated = await isFederatedDomain(
      'tenant.auth0.com',
      email.split('@')[1]
    );

    if (federated) {
      await loginWithRedirectMock({
        authorizationParams: { login_hint: email }
      });
    }

    expect(loginWithRedirectMock).toHaveBeenCalledWith({
      authorizationParams: { login_hint: email }
    });
  });

  it('returns false on discovery failure so the flow fails closed', async () => {
    isFederatedDomainMock.mockResolvedValue(false);

    const federated = await isFederatedDomain('tenant.auth0.com', 'acme.com');

    expect(federated).toBe(false);
  });
});
