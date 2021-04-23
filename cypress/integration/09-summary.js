/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Summary page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/seedbank/notification').as('notification');
    cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
    cy.visit('/');
    cy.wait('@notification');
    cy.wait('@summary');
  });

  it('has the summary title', () => {
    cy.get('#title').contains('Summary');
  });

  it('display endpoint result', () => {
    cy.get('#declineTour').click()
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
    cy.get('#update-row-Withdrawn').contains('2 accessions');
  });

  context('navigation', () => {
    it('navigates to database page', () => {
      cy.get('#declineTour').click()
      cy.get('#tab-database').click().url().should('contain', '/accessions');
    });

    it('navigates to database page filtered by pending state when clicking on Most recent update', () => {
      cy.get('#declineTour').click()
      cy.get('#update-Pending').click().url().should('contain', '/accessions');
      cy.get('#subtitle').should('contain', '6 total');
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-Pending').should('have.checked', 'true');
      cy.get('#filter-list-state').type('{esc}');
    });

    it('navigates to database page filtered by processed state when clickin on Most recent update', () => {
      cy.get('#declineTour').click()
      cy.get('#update-Processed')
        .click()
        .url()
        .should('contain', '/accessions');
      cy.get('#subtitle').should('contain', '2 total');
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-Processed').should('have.checked', 'true');
      cy.get('#filter-list-state').type('{esc}');
    });
  });
});

describe.skip('Summary page - Spinners', () => {
  it('display loading spinner', () => {
    cy.intercept('GET', '/api/v1/seedbank/notification').as('notification');
    cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');

    cy.visit('/');

    cy.get('#spinner-summary-sessions').should('exist');
    cy.get('#spinner-summary-species').should('exist');
    cy.get('#spinner-summary-families').should('exist');
    cy.get('#spinner-alerts').should('exist');
    cy.get('#spinner-updates').should('exist');

    cy.wait('@notification');
    cy.wait('@summary');

    cy.get('#spinner-summary-sessions').should('not.exist');
    cy.get('#spinner-summary-species').should('not.exist');
    cy.get('#spinner-summary-families').should('not.exist');
    cy.get('#spinner-alerts').should('not.exist');
    cy.get('#spinner-updates').should('not.exist');
  });
});
