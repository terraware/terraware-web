/**
 * TODO redo tests
 */
describe.skip('Summary page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');
    cy.visit('/seeds-dashboard');
    cy.wait('@summary');
  });

  it('display endpoint result', () => {
    cy.get('#sessions-current').contains('9');

    cy.get('#species-current').contains('4');

    cy.get('#update-row-Pending').contains('0 seed collection');
    cy.get('#update-row-Processed').contains('0 accessions');
    cy.get('#update-row-Dried').contains('1 accessions');
    cy.get('#update-row-Withdrawn').contains('2 accessions');
  });

  context('navigation', () => {
    it('navigates to database page', () => {
      cy.visit('/accessions');
    });

    it('navigates to database page filtered by pending state when clicking on Most recent update', () => {
      cy.get('#update-Pending').click().url().should('contain', '/accessions');
      cy.get('#subtitle').should('contain', '1 total');
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-Pending').should('have.checked', 'true');
      cy.get('#filter-list-state').type('{esc}');
    });

    it('navigates to database page filtered by processed state when clicking on Most recent update', () => {
      cy.get('#update-Processed').click().url().should('contain', '/accessions');
      cy.get('#subtitle').should('contain', '0 total');
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-Processed').should('have.checked', 'true');
      cy.get('#filter-list-state').type('{esc}');
    });
  });
});

describe.skip('Summary page - Spinners', () => {
  it('display loading spinner', () => {
    cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');

    cy.visit('/');

    cy.get('#spinner-summary-sessions').should('exist');
    cy.get('#spinner-summary-species').should('exist');
    cy.get('#spinner-alerts').should('exist');
    cy.get('#spinner-updates').should('exist');

    cy.wait('@summary');

    cy.get('#spinner-summary-sessions').should('not.exist');
    cy.get('#spinner-summary-species').should('not.exist');
    cy.get('#spinner-alerts').should('not.exist');
    cy.get('#spinner-updates').should('not.exist');
  });
});
