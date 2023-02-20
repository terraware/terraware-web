/* eslint-disable no-undef */
/// <reference types="cypress" />

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import '@cypress/code-coverage/support';
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Make all requests look like they are associated with an existing login session
// so we don't have to depend on a Keycloak server to run the test suite. The
// session value here is the base64-encoded session ID from dump/session.sql.
beforeEach(() => {
  cy.setCookie('SESSION', 'NTZiMGYzYzgtZjY3OS00YmEyLWFkNzgtYzM0ODFiNjM5ZjI0');
});

declare global {
  // eslint-disable-next-line
  namespace Cypress {
    interface Chainable {
      interrupt: () => void;
    }
  }
}

function abortEarly() {
  if (this.currentTest.state === 'failed') {
    return cy.task('shouldSkip', true);
  }
  cy.task('shouldSkip').then((value) => {
    if (value) return cy.interrupt();
  });
}
