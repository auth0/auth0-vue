import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// The spa-js module is mocked so the re-export chain resolves without a real
// network call. isFederatedDomain is given a controllable implementation so we
// can drive the federated / non-federated branches of discovery.
const isFederatedDomainMock = jest.fn<any>();

jest.mock('@auth0/auth0-spa-js', () => ({
  __esModule: true,
  Auth0Client: jest.fn(),
  isFederatedDomain: (...args: unknown[]) => isFederatedDomainMock(...args)
}));

import { isFederatedDomain } from '../src/index';

describe('Enterprise Connect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('re-exports isFederatedDomain from the package root', async () => {
    isFederatedDomainMock.mockResolvedValue(true);

    const federated = await isFederatedDomain('tenant.auth0.com', 'acme.com');

    expect(federated).toBe(true);
    expect(isFederatedDomainMock).toHaveBeenCalledWith(
      'tenant.auth0.com',
      'acme.com'
    );
  });

  it('propagates false for an unmanaged domain', async () => {
    isFederatedDomainMock.mockResolvedValue(false);

    const federated = await isFederatedDomain('tenant.auth0.com', 'gmail.com');

    expect(federated).toBe(false);
  });

  // spa-js fails closed: a network error, 429, or any non-ok status resolves to
  // false rather than throwing, so discovery failures route to the fallback
  // login instead of surfacing an error the caller must catch.
  it('resolves false rather than rejecting when discovery fails', async () => {
    isFederatedDomainMock.mockResolvedValue(false);

    await expect(
      isFederatedDomain('tenant.auth0.com', 'acme.com')
    ).resolves.toBe(false);
  });
});
