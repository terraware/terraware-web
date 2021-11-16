/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Filter plants', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#plants').click().url().should('contain', '/plants-dashboard');
    cy.get('#plants-list').click().url().should('contain', '/plants-list');
  });

  it('should filter by min_entered_time', () => {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var dateStr = d.toLocaleDateString('en-US', {
      month: '2-digit',
      year: 'numeric',
      day: '2-digit',
    });

    cy.get('#show-filters').click();
    cy.get('#minEnteredTime').type(dateStr);
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should(
      'have.length',
      1
    );
  });

  it('should filter by max_entered_time and reset filters after', () => {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var dateStr = d.toLocaleDateString('en-US', {
      month: '2-digit',
      year: 'numeric',
      day: '2-digit',
    });

    cy.get('#show-filters').click();
    cy.get('#maxEnteredTime').type(dateStr);
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should(
      'have.length',
      2
    );

    cy.get('#clear-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should(
      'have.length',
      3
    );
  });

  it('should filter by species', () => {
    cy.get('#show-filters').click();
    cy.get('#speciesName').click();
    cy.get('#Banana').click();
    cy.get('#apply-filters').click();
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should(
      'have.length',
      2
    );
  });
});
