/* eslint-disable no-undef */
/// <reference types="cypress" />
describe('Processing and Drying', () => {
  it('should create the accession and navigate to processing and drying section', () => {
    cy.visit('/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#menu-processing-drying').click();
  });

  it('should add processing and drying information', () => {
    cy.get('#processingMethod').click();
    cy.get('#Count').click();
    cy.get('#quantity').type(300);
    cy.get('#check-Nursery').click();
    cy.get('#dryingStartDate').type('01/01/2021');
    cy.get('#dryingEndDate').type('01/01/2021');
    cy.get('#dryingMoveDate').type('01/01/2021');
    cy.get('#processingNotes').type('A processing note');
    cy.get('#processingStaffResponsible').type('Constanza');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#processingMethod + input').should('have.value', 'Count');
    cy.get('#quantity').should('have.value', '300');
    cy.get('#check-Nursery').should('have.checked', 'true');
    cy.get('#dryingStartDate').should('have.value', '01/01/2021');
    cy.get('#dryingEndDate').should('have.value', '01/01/2021');
    cy.get('#dryingMoveDate').should('have.value', '01/01/2021');
    cy.get('#processingNotes').should('have.value', 'A processing note');
    cy.get('#processingStaffResponsible').should('have.value', 'Constanza');
  });

  it('should clear textfield if changing dropdown', () => {
    cy.get('#processingMethod').click();
    cy.get('#Weight').click();

    cy.get('#subsetWeight').type(500);
    cy.get('#subsetCount').type(500);
    cy.get('#quantity').type(500);
    cy.get('#estimatedSeedCount').should('have.value', '500');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#subsetWeight').should('have.value', '500');
    cy.get('#estimatedSeedCount').should('have.value', '500');

    cy.get('#processingMethod').click();
    cy.get('#Count').click();
    cy.get('#quantity').should('have.value', '');

    cy.get('#quantity').type(400);

    cy.get('#processingMethod').click();
    cy.get('#Weight').click();
    cy.get('#subsetWeight').should('have.value', '');

    cy.get('#processingMethod').click();
    cy.get('#Count').click();
    cy.get('#quantity').should('have.value', '');
  });

  it('should show error if processing method is weight and quantity is not filled', () => {
    cy.get('#processingMethod').click();
    cy.get('#Weight').click();

    cy.get('#saveAccession').click()
    cy.get('#quantity').parent().should('have.class', 'Mui-error');
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('5');
      cy.get('#sessions-change').contains('67% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('4');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('2');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('1 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});
