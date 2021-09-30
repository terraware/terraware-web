/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Map', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should make the map bigger', () => {
    cy.get('.overlays')
      .invoke('css', 'width')
      .then((str) => {
        const initialWidth = parseInt(str);
        cy.get('#full-screen').click();
        cy.get('.overlays')
          .invoke('css', 'width')
          .then((str) => parseInt(str))
          .should('be.gt', initialWidth);
      });
  });
});
