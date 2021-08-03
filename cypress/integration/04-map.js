/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Map', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.get('#username').type(Cypress.env('user'));
        cy.get('#password').type(Cypress.env('pass'));
        cy.get('#login').click();
    });

    it('should render the data on the map', () => {
        cy.get('.mapboxgl-marker').should('have.length', 4);
    });

    it('should open the data when clicking on marker', () => {
        cy.get('.mapboxgl-marker').first().click().then(() => {
            cy.get('.mapboxgl-popup-content').should('exist');
            cy.get('#feature-species-name').should('exist');
            cy.get('#feature-coordinates').should('exist');
            cy.get('#feature-image').should('exist');
            cy.get('#new-species').should('exist');
        });
    });

    it('should make the map bigger', () => {
        cy.get('.overlays').invoke('css', 'width')
            .then(str => {
                const initialWidth = parseInt(str)
                cy.get('#full-screen').click();
                cy.get('.overlays').invoke('css', 'width')
                    .then(str => parseInt(str)).should('be.gt', initialWidth);
            })
    });
});
