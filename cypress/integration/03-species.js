/* eslint-disable no-undef */
/// <reference types="cypress" />

describe.skip('Species', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#species').click().url().should('contain', '/species');
  });

  it('should create a new species', () => {
    cy.get('#new-species').click();
    cy.get('#name').type('Species 1');
    cy.get('#save-specie').click();

    cy.get('#species-table #row3-name').should('contain', 'Species 1');
    cy.get('#snackbar').should('contain', 'New species added just now.');
  });

  it('should edit a species', () => {
    cy.get('#species-table #row3').click();
    cy.get('#name').clear().type('Species 2');
    cy.get('#save-specie').click();

    cy.get('#species-table #row3-name').should('contain', 'Species 2');
    cy.get('#snackbar').should('contain', 'Changes saved just now.');
  });
});
