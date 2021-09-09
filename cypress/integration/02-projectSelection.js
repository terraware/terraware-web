/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Projects', () => {
  context('Select project', () => {
    it('should have selected first project by default', () => {
      cy.visit('/');
      cy.get('#projects').contains('Pacific Flight');
    });

    it('should change project correctly', () => {
      cy.get('#projects').click();
      cy.get('#2').click();
      cy.get('#projects').contains('Future Forests');
    });
  });
});
