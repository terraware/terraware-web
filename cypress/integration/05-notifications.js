/**
 * TODO: redo notifications tests
 */
describe.skip('Notifications', () => {
  beforeEach(() => {
    cy.visit('/seeds-dashboard');
  });

  it('display endpoint result', () => {
    cy.get('#notifications-button').click();
    cy.get('#notifications-popover').should('be.visible');
    cy.get('#notifications-popover').children().should('have.length', 11);
    cy.get('#notifications-badge').contains('10');
  });

  it('go to accesions filtered by state when clicking State notification', () => {
    cy.get('#notifications-button').click();

    cy.intercept('POST', '/api/v1/seedbank/values').as('search');
    cy.get('#notification4').click().url().should('contain', '/accessions');
    cy.get('#notification4').type('{esc}');
    cy.wait('@search');

    cy.get('#subtitle').should('contain', '1 total');

    cy.get('#filter-state').click();
    cy.get('#filter-list-state').should('be.visible');
    cy.get('#check-Dried').should('have.checked', 'true');
    cy.get('#filter-list-state').type('{esc}');

    cy.get('#notifications-button').click();
    cy.intercept('POST', '/api/v1/seedbank/values').as('search2');
    cy.get('#notification3').click().url().should('contain', '/accessions');
    cy.get('#notification3').click().type('{esc}');
    cy.wait('@search2');

    cy.get('#subtitle').should('contain', '1 total');

    cy.get('#filter-state').click();
    cy.get('#filter-list-state').should('be.visible');
    cy.get('#check-In\\ Storage').should('have.checked', 'true');
    cy.get('#filter-list-state').type('{esc}');
  });

  it('go to accesion page when clicking Date notification', () => {
    cy.get('#notifications-button').click();

    cy.get('#notification9').click().url().should('contain', '/accessions/1000');
  });

  it('has 7 notifications unread after clicking', () => {
    cy.get('#notifications-badge').contains('7');
  });
});
