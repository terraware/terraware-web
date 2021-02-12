/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Summary page - Notifications", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("display endpoint result", () => {
    cy.get(':nth-child(4) > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root').children().should('have.length', 1);
    cy.get(':nth-child(4) > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > .MuiButtonBase-root').should('have.class',  'MuiFab-secondary');
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiList-root').should('be.visible');
    cy.get('.MuiList-root').children().should('have.length', 11);
  });

  it("go to accesions filtered by state when clicking State notification", () => {
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiList-root > :nth-child(5)').click().wait(2000).url().should("contain", "/accessions?state");
  });

  it("go to accesion page when clicking Date notification", () => {
    cy.get(':nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiList-root > :nth-child(10)').click().wait(2000).url().should("contain", "/accessions/XYZ");
  });

  it("has 8 notifications unread after clicking", () => {
    cy.get(':nth-child(2) > .MuiButtonBase-root').click().wait(2000);
    cy.get('.MuiBadge-badge').contains('8');
  });

});
