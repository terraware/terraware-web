/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Species', () => {
  it('should exists species created when modifying', () => {
    cy.visit('/species');
    cy.get('#row2-name').should('contain','Kousa Dogwoord Modified');
    cy.get('#row3-name').should('contain','Kousa Dogwoord New');
  });

  it('should create a new specie', () => {
    cy.get('#new-species').click();
    cy.get('#name').clear().type('New specie');

    cy.intercept('GET', 'api/v1/seedbank/values/species').as('getSpecies');
    cy.get('#saveSpecie').click();
    cy.wait('@getSpecies');
    

    cy.get('#row4-name').should('contain','New specie');
  });

  it('should edit a specie', () => {
    cy.get('#row2').click();

    cy.get('#name').type('2');
    cy.intercept('GET', 'api/v1/seedbank/values/species').as('getSpecies');
    cy.get('#saveSpecie').click();
    cy.wait('@getSpecies');
    

    cy.get('#row2-name').should('contain','Kousa Dogwoord Modified2');
  });
});
