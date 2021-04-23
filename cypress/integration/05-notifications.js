/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Notifications', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/seedbank/notification').as('notification');
    cy.visit('/');
    cy.wait('@notification');
  });

  it('display endpoint result', () => {
    cy.get('#declineTour').click()
    cy.get('#alerts-table').children().should('have.length', 1);
    cy.get('#notifications-button').click();
    cy.get('#notifications-popover').should('be.visible');
    cy.get('#notifications-popover').children().should('have.length', 11);
    cy.get('#notifications-badge').contains('10');
  });

  it('go to accesions filtered by state when clicking State notification', () => {
    cy.get('#declineTour').click()
    cy.get('#notifications-button').click();

    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as(
      'markRead'
    );
    cy.intercept('POST', '/api/v1/seedbank/notification').as('notification');
    cy.intercept('POST', '/api/v1/seedbank/values').as('search');
    cy.get('#notification4')
      .click()
      .url()
      .should('contain', '/accessions');
      cy.wait('@markRead');
      cy.wait('@notification');
      cy.wait('@search')
      cy.get('#simple-popover > .MuiPaper-root').type('{esc}');
      
      cy.get('#subtitle').should('contain', '1 total');

      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-Dried').should('have.checked', 'true');
      cy.get('#filter-list-state').type('{esc}');

    cy.get('#notifications-button').click();
    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as(
      'markRead2'
    );
    cy.intercept('POST', '/api/v1/seedbank/values').as('search2');
    cy.intercept('POST', '/api/v1/seedbank/notification').as('notification2');
    cy.get('#notification3')
      .click()
      .url()
      .should('contain', '/accessions');
      cy.wait('@markRead2');
      cy.wait('@notification2');
      cy.wait('@search2')
      cy.get('#simple-popover > .MuiPaper-root').type('{esc}');
      
      cy.get('#subtitle').should('contain', '1 total');

      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-In\\ Storage').should('have.checked', 'true');
      cy.get('#filter-list-state').type('{esc}');

  });

  it('go to accesion page when clicking Date notification', () => {
    cy.get('#declineTour').click()
    cy.get('#notifications-button').click();

    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as(
      'markRead'
    );
    cy.intercept('POST', '/api/v1/seedbank/notification').as('notification');
    cy.get('#notification9').click().url().should('contain', '/accessions/XYZ');
    cy.wait('@markRead');
    cy.wait('@notification');
  });

  it('has 7 notifications unread after clicking', () => {
    cy.get('#declineTour').click()
    cy.get('#notifications-badge').contains('7');
  });
});
