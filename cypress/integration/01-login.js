/* eslint-disable no-undef */
/// <reference types="cypress" />

// plugins/index.js
require('dotenv').config()

module.exports = (on, config) => {
  // copy any needed variables from process.env to config.env
  config.env.username = process.env.REACT_APP_TERRAWARE_API_DEFAULT_USER
  config.env.password = process.env.REACT_APP_TERRAWARE_API_DEFAULT_PASS

  // do not forget to return the changed config object!
  return config
}

describe('Login', () => {
  context('Login', () => {
    it('should login and navigate to dahboard page, then logout and return to login page', () => {
      cy.visit('/');
      cy.get('#username').type(Cypress.env('username'));
      cy.get('#password').type(`${process.env.REACT_APP_TERRAWARE_API_DEFAULT_PASS}`);
      cy.get('#login').click().url()
        .should('contain', '/dashboard');
      cy.get('#logout').click().url()
        .should('contain', '/');
    });
  });
});
