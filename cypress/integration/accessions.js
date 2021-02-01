/* eslint-disable no-console */
/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Accessions", () => {
  context("Navigation", () => {
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
  });

  context("Accessions", () => {
    it("should create the accession", () => {
      cy.visit("/");
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

      cy.get('#species').should('have.value', "Kousa Dogwoord");
      cy.get('#family').should('have.value', "Cornaceae");
      cy.get('#numberOfTrees').should('have.value', "3");
      cy.get('#founderId').should('have.value', "234908098");
      cy.get('#endangered > .MuiButtonBase-root > .MuiIconButton-label > .jss108').should('have.value', "true");
      cy.get('#rare > .MuiButtonBase-root > .MuiIconButton-label > .jss108').should('have.value', "true");

      cy.get('#fieldNotes').should('have.value', "Some notes");
  
      cy.get('#collectedDate').should('have.value', "02 / 01 / 2021");
      cy.get('#receivedDate').should('have.value', "02 / 03 / 2021");
  
      cy.get('#primaryCollector').should('have.value', "Carlos");
      cy.get('#secondaryCollectors\\[0\\]').should('have.value', "Constanza");
      cy.get('#secondaryCollectors\\[1\\]').should('have.value', "Leann");
  
      cy.get('#siteLocation').should('have.value', "Sunset Overdrive");
      cy.get('#landowner').should('have.value', "Yacin");
      cy.get('#environmentalNotes').should('have.value', "Cold day");
    });
  
    it("should update the accession", () => {
      cy.get('#delete-secondaryCollectors\\[1\\]').click();
      cy.get('#primaryCollector').clear().type("Leann");
      cy.get('#fieldNotes').clear().type("Other notes");

      cy.get('#submit').click().url().should("match", /accessions\/[A-Za-z0-9]+\/seed-collection/);
  
      cy.wait(2000);
      cy.get('#fieldNotes').contains('Other notes');
      cy.get('#secondaryCollectors\\[1\\]').should('not.exist');
      cy.get('#primaryCollector').should('have.value', 'Leann');
    })
  });

});
