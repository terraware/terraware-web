/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Summary page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has the summary title', () => {
    cy.get('.MuiBox-root > .MuiTypography-root').contains('Summary');
  });

  it('display endpoint result', () => {
    cy.get(
      ':nth-child(1) > .MuiPaper-root > .MuiCircularProgress-root > .MuiCircularProgress-svg'
    ).should('have.class', 'MuiCircularProgress-svg');
    cy.get(
      ':nth-child(2) > .MuiPaper-root > .MuiCircularProgress-root > .MuiCircularProgress-svg'
    ).should('have.class', 'MuiCircularProgress-svg');
    cy.get(
      ':nth-child(3) > .MuiPaper-root > .MuiCircularProgress-root > .MuiCircularProgress-svg'
    ).should('have.class', 'MuiCircularProgress-svg');
    cy.get(
      '.MuiTableCell-root > .MuiCircularProgress-root > .MuiCircularProgress-svg'
    ).should('have.class', 'MuiCircularProgress-svg');

    cy.get(':nth-child(1) > .MuiPaper-root > .MuiTypography-h4').contains('9');
    cy.get(':nth-child(1) > .MuiPaper-root .MuiSvgIcon-root').should(
      'have.class',
      'MuiSvgIcon-colorPrimary'
    );
    cy.get(':nth-child(1) > .MuiPaper-root .MuiTypography-root').contains(
      '200% since last week'
    );
    cy.get(':nth-child(2) > .MuiPaper-root > .MuiTypography-h4').contains('3');
    cy.get(':nth-child(2) > .MuiPaper-root > .makeStyles-flex-32')
      .children()
      .should('have.length', 1);
    cy.get(':nth-child(2) > .MuiPaper-root .MuiTypography-root').should(
      'have.value',
      ''
    );
    cy.get(':nth-child(3) > .MuiPaper-root > .MuiTypography-h4').contains('2');
    cy.get(':nth-child(3) > .MuiPaper-root > .makeStyles-flex-32')
      .children()
      .should('have.length', 1);
    cy.get(':nth-child(3) > .MuiPaper-root .MuiTypography-root').should(
      'have.value',
      ''
    );
    cy.get('.MuiGrid-grid-xs-8 > .MuiPaper-root').contains(
      'Most recent updates'
    );
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root .MuiTableBody-root'
    )
      .children()
      .should('have.length', 4);
    cy.get(
      ':nth-child(1) > :nth-child(1) > .MuiChip-root > .MuiChip-label'
    ).contains('Pending');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(1) .MuiChip-root'
    ).should('have.css', 'background-color', 'rgb(183, 231, 219)');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2)'
    ).contains(0);
    cy.get(
      ':nth-child(2) > :nth-child(1) > .MuiChip-root > .MuiChip-label'
    ).contains('Processed');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(1) .MuiChip-root'
    ).should('have.css', 'background-color', 'rgb(230, 237, 253)');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(2)'
    ).contains(0);
    cy.get(
      ':nth-child(3) > :nth-child(1) > .MuiChip-root > .MuiChip-label'
    ).contains('Dried');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(3) > :nth-child(1) .MuiChip-root'
    ).should('have.css', 'background-color', 'rgb(255, 206, 190)');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(3) > :nth-child(2)'
    ).contains(0);
    cy.get(
      ':nth-child(4) > :nth-child(1) > .MuiChip-root > .MuiChip-label'
    ).contains('Withdrawn');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(4) > :nth-child(1) .MuiChip-root'
    ).should('have.css', 'background-color', 'rgb(108, 117, 125)');
    cy.get(
      '.MuiGrid-grid-xs-8 > .MuiPaper-root > .MuiTable-root > .MuiTableBody-root > :nth-child(4) > :nth-child(2)'
    ).contains(2);
  });

  context('navigation', () => {
    it('navigates to database page', () => {
      cy.get('[href="/accessions"]')
        .click()
        .url()
        .should('contain', '/accessions');
    });

    it('navigates to database page filtered by pending state when clickin on Most recent update', () => {
      cy.get(':nth-child(1) > :nth-child(1) > .MuiChip-root')
        .click()
        .url()
        .should('contain', '/accessions');
      cy.get('#subtitle').should('contain', '5 total');
    });

    it('navigates to database page filtered by proessed state when clickin on Most recent update', () => {
      cy.get('[href="/accessions?state=Processed"]')
        .click()
        .url()
        .should('contain', '/accessions');
      cy.get('#subtitle').should('contain', '2 total');
    });
  });
});
