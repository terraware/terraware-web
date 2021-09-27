/* eslint-disable no-undef */
/// <reference types="cypress" />

describe.skip('Map', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('should render the data on the map', () => {
    cy.get('.mapboxgl-marker').should('have.length', 4);
  });

  it('should open the data when clicking on marker', () => {
    cy.get('.mapboxgl-marker')
      .first()
      .click()
      .then(() => {
        cy.get('.mapboxgl-popup-content').should('exist');
        cy.get('#feature-species-name').contains('Banana');
        cy.get('#feature-coordinates').contains('45.467135,-75.546518');
        cy.get('#feature-image').should('exist');
        cy.get('#new-species').should('exist');
      });
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

  it('should change species from map', () => {
    cy.get('.mapboxgl-ctrl-zoom-in').click();
    cy.get('.mapboxgl-ctrl-zoom-in').click();
    cy.get('.mapboxgl-marker svg')
      .first()
      .click()
      .then(() => {
        cy.get('#feature-species-name').contains('Banana');
        cy.get('#feature-coordinates').contains('45.467135,-75.546518');
        cy.get('#new-species').click();
        cy.get('#Other').click();
        cy.intercept('PUT', '/api/v1/plants/*').as('putPlant');
        cy.get('#saveSpecie').click();
        cy.wait('@putPlant');
        cy.get('.overlays').click();
        cy.get('#feature-species-name').should('contain', 'Other');
      });
  });
});
