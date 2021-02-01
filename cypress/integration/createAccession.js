/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("New Accession", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should navigate in and out of the new accession page", () => {
    cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
    cy.get('.MuiBox-root > .MuiButtonBase-root').click().url().should("contain", "/");

    cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
    cy.get('#cancel').click().url().should("contain", "/");
  });

  it("should handle the cancel button", () => {
    cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
    cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/");
  });

  it("should fill the form", () => {
    cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");

    cy.get('#species').type("Kousa Dogwoord");
    cy.get('#family').type("Cornaceae");
    cy.get('#numberOfTrees').type("3");
    cy.get('#founderId').type("234908098");
    cy.get('#endangered > .MuiButtonBase-root > .MuiIconButton-label').click();
    cy.get('#rare > .MuiButtonBase-root > .MuiIconButton-label').click();

    cy.get('#fieldNotes').type("Some notes");

    cy.get('#collectedDate').type("02/01/2021");
    cy.get('#receivedDate').type("02/03/2021");

    cy.get('#primaryCollector').type("Carlos");
    cy.get('#secondaryCollectors\\[0\\]').type("Constanza");
    cy.get(':nth-child(14) > :nth-child(2) > .MuiTypography-root').click()
    cy.get('#secondaryCollectors\\[1\\]').type("Leann");

    cy.get('#siteLocation').type("Sunset Overdrive");
    cy.get('#landowner').type("Yacin");
    cy.get('#environmentalNotes').type("Cold day");

    cy.get('#submit').click().url().should("match", /accessions\/[A-Za-z0-9]+\/seed-collection/);
  });  

});
