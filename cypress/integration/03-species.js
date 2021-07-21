/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#username').type(Cypress.env('user'));
    cy.get('#password').type(Cypress.env('pass'));
    cy.get('#login').click();
    cy.get('#species').click().url()
      .should('contain', '/species');
  });

  it('should create a new specie', () => {
    cy.get('#new-species').click();
    cy.get('#name').type('Species 1');
    cy.get('#save-specie').click();

    cy.get('#species-table #row1-name').should('contain', 'Species 1');
    cy.get('#snackbar').should('contain', 'New species added just now.');
  });

  it('should edit a specie', () => {
    cy.get('#species-table #row1').click();
    cy.get('#name').clear().type('Species 2');
    cy.get('#save-specie').click();


    cy.get('#species-table #row1-name').should('contain', 'Species 2');
    cy.get('#snackbar').should('contain', 'Changes saved just now.');
  });

  it('should delete a specie', () => {
    cy.get('#species-table #row1').click();
    cy.get('#delete-specie').click();
    cy.get('#delete').click();

    cy.get('#species-table #row1').should('not.exist');
    cy.get('#snackbar').should('contain', 'Species deleted just now.');
  });
});
