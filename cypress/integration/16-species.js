/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Species', () => {
  it('should create a new species', () => {
    cy.visit('/species');
    cy.get('#new-species').click();
    cy.get('#name').type('Species 1');
    cy.get('#save-specie').click();

    cy.get('#species-table #row7-name').should('contain', 'Species 1');
    cy.get('#snackbar').should('contain', 'New species added just now.');
  });

  it('should edit a species', () => {
    cy.visit('/species');
    cy.get('#species-table #row7').click();
    cy.get('#name').clear().type('Species 2');
    cy.get('#save-specie').click();

    cy.get('#species-table #row7-name').should('contain', 'Species 2');
    cy.get('#snackbar').should('contain', 'Changes saved just now.');
  });
});
