/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Notifications', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/seedbank/notification').as('notification');
    cy.visit('/');
    cy.wait('@notification');
  });

  it('display endpoint result', () => {
    cy.get('#alerts-table').children().should('have.length', 1);
    cy.get('#notifications-button').click();
    cy.get('#notifications-popover').should('be.visible');
    cy.get('#notifications-popover').children().should('have.length', 11);
    cy.get('#notifications-badge').contains('10');
  });

  it('go to accesions filtered by state when clicking State notification', () => {
    cy.get('#notifications-button').click();

    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as(
      'markRead'
    );
    cy.intercept('POST', '/api/v1/seedbank/notification').as('notification');
    cy.get('#notification4')
      .click()
      .url()
      .should('contain', '/accessions?state=Dried');
    cy.get('#subtitle').should('contain', '0 total');
    cy.wait('@markRead');
    cy.wait('@notification');

    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as(
      'markRead2'
    );
    cy.intercept('POST', '/api/v1/seedbank/notification').as('notification2');
    cy.get('#notification3')
      .click()
      .url()
      .should('contain', '/accessions?state=In%20Storage');
    cy.get('#subtitle').should('contain', '1 total');
    cy.wait('@markRead2');
    cy.wait('@notification2');
  });

  it('go to accesion page when clicking Date notification', () => {
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
    cy.get('#notifications-badge').contains('7');
  });
});
