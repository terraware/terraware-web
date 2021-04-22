/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Searchbar', () => {
  context('search', () => {
    it('should redirect the user to the correct page', () => {
      cy.visit('/accessions/new');
      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#header-accessionNumber').then(($accessionNumberElement) => {
        const accessionNumber = $accessionNumberElement.text();
        cy.visit('/');
        cy.get('#declineTour').click()
        cy.get('#search-bar').type(accessionNumber);
        cy.get('#search-bar-option-0')
          .click()
          .url()
          .should('include', `/accessions/${accessionNumber}/seed-collection`);
      });
    });
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('11');
      cy.get('#sessions-change').contains('267% since last week');
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
