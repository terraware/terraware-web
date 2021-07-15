/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Login', () => {
  context('Login', () => {
    it('should login and navigate to dahboard page, then logout and return to login page', () => {
      cy.visit('/');
      cy.get('#username').type(Cypress.env('user'));
      cy.get('#password').type(Cypress.env('pass'));
      cy.get('#login').click().url()
        .should('contain', '/dashboard');
      cy.get('#logout').click().url()
        .should('contain', '/');
    });
  });
});
