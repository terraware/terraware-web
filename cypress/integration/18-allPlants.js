/* eslint-disable no-undef */
/// <reference types="cypress" />

describe.skip('All plants', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#plants').click().url().should('contain', '/plants');
  });

  it('should render the data on the table', () => {
    cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should(
      'have.length',
      4
    );

    var d = new Date();
    d.setDate(d.getDate() - 7);
    var dateStr = d.toLocaleDateString('en-US', {
      month: '2-digit',
      year: 'numeric',
      day: '2-digit',
    });

    cy.get('#row1-date').should('contain', dateStr);
    cy.get('#row1-species').should('contain', 'Other');
    cy.get('#row1-geolocation').should('contain', '45.467135, -75.546518');
    cy.get('#row1-notes').should('contain', 'Testing notes');
  });

  it('should edit species of a plant, selecting a previous existent species', () => {
    cy.get('#row1').click();
    cy.get('#Banana').click();
    cy.get('#saveSpecie').click();

    cy.get('#row1-species').should('contain', 'Banana');
  });

  it('should order by Species name', () => {
    cy.get('#table-header-species').click();
    cy.get('#row1-species').should('contain', 'Coconut');
  });

  it('should edit species of a plant, creating a new species', () => {
    cy.get('#row1').click();
    cy.get('#new-specie-section #species').click().type('Acacia');
    cy.get('#saveSpecie').click();

    cy.get('#row1-species').should('contain', 'Acacia');
  });

  it('should delete plant', () => {
    cy.get('#row1').click();
    cy.get('#delete-specie').click();
    cy.get('#delete').click();

    cy.get('#row1-species').should('not.contain', 'Acacia');
  });
});
