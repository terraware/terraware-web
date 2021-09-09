/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Summary', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has the right summary results in the first project', () => {
    cy.get('#summary-Plants').contains('4 Plants');
    cy.get('#summary-Species').contains('3 Species');
    cy.get('#summary-Plants-value').contains('33% since last week');
    cy.get('#summary-Species-value').contains('50% since last week');
    cy.get('#Species-arrow-increase').should('exist');
    cy.get('#Plants-arrow-increase').should('exist');
  });

  context('Changing projects', () => {
    beforeEach(() => {
      cy.get('#projects').click();
      cy.get('#2').click();
    });

    it('should change project correctly', () => {
      cy.get('#projects').contains('Future Forests');
    });

    it('has the right summary results in the second project', () => {
      cy.get('#summary-Plants').contains('0 Plants');
      cy.get('#summary-Species').contains('0 Species');
      cy.get('#summary-Plants-value').should('not.exist');
      cy.get('#summary-Species-value').should('not.exist');
      cy.get('#Species-arrow-increase').should('not.exist');
      cy.get('#Plants-arrow-increase').should('not.exist');
    });
  });
});
