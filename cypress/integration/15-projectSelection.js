/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Projects', () => {
  context('Select project', () => {
    it('should have selected first project by default', () => {
      cy.visit('/dashboard');
      cy.get('#projects').contains('Example Project');
    });
  });
});
