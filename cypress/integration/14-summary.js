/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Summary', () => {
  beforeEach(() => {
    cy.visit('/plants-dashboard');
  });
  it('has the right summary results in the first project', () => {
    cy.get('#summary-Plants').contains('4 Plants');
    cy.get('#summary-Species').contains('2 Species');
    cy.get('#summary-Plants-value').contains('33% since last week');
    cy.get('#summary-Species-value').contains('100% since last week');
    cy.get('#Species-arrow-increase').should('exist');
    cy.get('#Plants-arrow-increase').should('exist');
  });
});
