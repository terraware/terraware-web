/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Notifications', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('display endpoint result', () => {
    cy.get(
      ':nth-child(4) > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root'
    )
      .children()
      .should('have.length', 1);
    cy.get(
      ':nth-child(4) > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > .MuiButtonBase-root'
    ).should('have.class', 'MuiFab-secondary');
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiList-root').should('be.visible');
    cy.get('.MuiList-root').children().should('have.length', 11);
  });

  it('go to accesions filtered by state when clicking State notification', () => {
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiList-root > :nth-child(5)')
      .click()
      .url()
      .should('contain', '/accessions?state=Dried');
    cy.get('#subtitle').should('contain', '0 total');

    cy.get('[href="/accessions?state=In Storage"]')
      .click()
      .url()
      .should('contain', '/accessions?state=In%20Storage');
    cy.get('#subtitle').should('contain', '1 total');
  });

  it('go to accesion page when clicking Date notification', () => {
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiList-root > :nth-child(10)')
      .click()
      .url()
      .should('contain', '/accessions/XYZ');
  });

  it('has 7 notifications unread after clicking', () => {
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiBadge-badge').contains('7');
  });
});
