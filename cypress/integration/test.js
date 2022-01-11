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
    cy.get('#logout').should('be.visible').click();
    cy.get('button[name=logout]').should('be.visible').click();
    cy.get('#login_redirect').should('be.visible');
  });
});
