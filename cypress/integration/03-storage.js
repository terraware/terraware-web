/* eslint-disable no-undef */
/// <reference types="cypress" />
describe('Storage', () => {
  it('should create the accession and navigate to storage section', () => {
    cy.visit('/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#menu-storage').click();
  });
  
  it('should add storage information', () => {
    cy.get('#storageStartDate').type('02/04/2021');
    cy.get('#storagePackets').type('5');
    cy.get('#storageLocation').click();
    cy.get('#Freezer\\ 1').click();
    cy.get('#storageCondition').should('have.value', 'Freezer');

    cy.get('#storageLocation').click();
    cy.get('#Refrigerator\\ 2').click();
    cy.get('#storageCondition').should('have.value', 'Refrigerator');

    cy.get('#storageNotes').type('A storage note');
    cy.get('#storageStaffResponsible').type('Constanza');

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#storageStartDate').should('have.value', '02 / 04 / 2021');
    cy.get('#storagePackets').should('have.value', '5');
    cy.get('#storageLocation + input').should('have.value', 'Refrigerator 2');
    cy.get('#storageCondition').should('have.value', 'Refrigerator');
    cy.get('#storageNotes').should('have.value', 'A storage note');
    cy.get('#storageStaffResponsible').should('have.value', 'Constanza');
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('6');
      cy.get('#sessions-change').contains('100% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('3');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('2');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('0 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});