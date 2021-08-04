/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('All plants', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.get('#username').type(Cypress.env('user'));
        cy.get('#password').type(Cypress.env('pass'));
        cy.get('#login').click();
        cy.get('#plants').click().url()
            .should('contain', '/plants');
    });

    it('should render the data on the table', () => {
        cy.get('#all-plants-table .MuiTableBody-root .MuiTableRow-root').should('have.length', 4);

        cy.get('#row1-date').should('contain', '07/29/2021');
        cy.get('#row1-species').should('contain', 'Banana');
        cy.get('#row1-geolocation').should('contain', '45.467135, -75.546518');
        cy.get('#row1-photo').find("img").should('exist');
        cy.get('#row1-notes').should('contain', 'Testing notes');
    });

    it('should order by Species name', () => {
        cy.get('#table-header-species').click();
        cy.get('#row1-species').should('contain', 'Coconut');
    });
});
