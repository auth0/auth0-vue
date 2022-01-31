const EMAIL = Cypress.env('USER_EMAIL') || 'testing';
const PASSWORD = Cypress.env('USER_PASSWORD') || 'testing';

if (!EMAIL || !PASSWORD) {
  throw new Error(
    'You must provide CYPRESS_USER_EMAIL and CYPRESS_USER_PASSWORD environment variables'
  );
}

const login = () => {
  cy.get('.login-card')
    .should('have.length', 1)
    .then($form => {
      cy.get('input[name=login]').clear().type(EMAIL);
      cy.get('input[name=password]').clear().type(PASSWORD);
      cy.get('.login-submit').click();
      cy.get('.login-submit').click();
    });
};

const fixCookies = () => {
  // Temporary fix for https://github.com/cypress-io/cypress/issues/6375
  if (Cypress.isBrowser('firefox')) {
    cy.getCookies({ log: false }).then(cookies =>
      cookies.forEach(cookie => cy.clearCookie(cookie.name, { log: false }))
    );
    cy.log('clearCookies');
  } else {
    cy.clearCookies();
  }
};

const logout = () => {
  cy.get('button[data-cy=logout]').should('be.visible').click();
  cy.get('button[name=logout]').should('be.visible').click();
};

describe('Smoke tests', () => {
  afterEach(fixCookies);

  it('shows default logged out', () => {
    cy.visit('/');
    cy.get('[data-cy=authenticated]').contains('false');
  });

  it('shows logged in once logged in', () => {
    cy.visit('/');
    cy.get('#login_redirect').should('be.visible').click();

    login();

    cy.get('[data-cy=authenticated]').contains('true');

    logout();
  });

  it('do redirect login and show user and access token', () => {
    cy.visit('/');
    cy.get('#login_redirect').should('be.visible').click();

    cy.url().should('include', 'http://127.0.0.1:3000');

    login();

    cy.get('[data-cy=profile]').contains(`"sub": "${EMAIL}"`);
    cy.get('[data-cy=access-token]').should('not.exist');
    cy.get('[data-cy=get-token]').click();
    cy.get('[data-cy=access-token]').should('have.length', 1);

    logout();

    cy.get('#login_redirect').should('be.visible');
  });

  it('redirect to login when accessing a protected route', () => {
    cy.visit('/#/profile');

    cy.url().should('not.contain', 'http://127.0.0.1:3000/#/profile');
    cy.url().should('include', 'http://127.0.0.1:3000');

    login();

    cy.url().should('include', 'http://127.0.0.1:3000/#/profile');
    cy.get('.profile-header').contains(EMAIL);

    cy.get('[data-cy=home-menu]').should('be.visible').click();

    logout();
  });

  it('does not redirect to login when accessing a protected route while authenticated', () => {
    cy.visit('/');
    cy.get('#login_redirect').should('be.visible').click();

    cy.url().should('include', 'http://127.0.0.1:3000');

    login();

    cy.get('[data-cy=profile-menu]').should('be.visible').click();

    cy.url().should('include', 'http://127.0.0.1:3000/#/profile');
    cy.get('.profile-header').contains(EMAIL);

    cy.get('[data-cy=home-menu]').should('be.visible').click();

    logout();
  });
});
