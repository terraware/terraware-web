/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Searchbar", () => {

  context("search", () => {
    it("should redirect the user to the correct page", () => {
      cy.visit("/accessions/new")      
      cy.get('#submit').click();

      cy.get('#accessionId').then(($accessionNumberElement) => {
        const accessionNumber = $accessionNumberElement.text()
        cy.visit("/")  
        cy.get('#search-bar').type(accessionNumber);
        cy.get('#search-bar-option-0').click().url().should('include', `/accessions/${accessionNumber}/seed-collection`);
      })

    });
  })

})