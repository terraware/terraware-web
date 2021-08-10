/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Filter plants', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#username').type(Cypress.env('user'));
    cy.get('#password').type(Cypress.env('pass'));
    cy.get('#login').click().url().should('contain', '/dashboard');
    cy.get('#plants').click().url().should('contain', '/plants');
  });

  it('should filter by min_entered_time', () => {
    cy.get('#show-filters').click();
    cy.get('#min_entered_time').type('07/01/2021');
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 1);
  });

  it('should filter by max_entered_time and reset filters after', () => {
    cy.get('#show-filters').click();
    cy.get('#max_entered_time').type('07/01/2021');
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 2);

    cy.get('#clear-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 3);
  });

  it('should filter by species', () => {
    cy.get('#show-filters').click();
    cy.get('#species_name').click();
    cy.get('#Banana').click();
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 2);
  });

  it('should filter by notes and keep filter when navigating', () => {
    cy.get('#show-filters').click();
    cy.get('#notes').type('testing');
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 1);

    cy.get('#species').click().url().should('contain', '/species');
    cy.get('#plants').click().url().should('contain', '/plants');
    cy.get('#notes').should('exist');
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 1);
  });
});
