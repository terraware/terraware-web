describe('Notifications', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/seedbank/notification?*').as('notification');
    cy.visit('/seeds-summary');
    cy.wait('@notification');
  });

  it('display endpoint result', () => {
    cy.get('#alerts-table').children().should('have.length', 1);
    cy.get('#notifications-button').click();
    cy.get('#notifications-popover').should('be.visible');
    cy.get('#notifications-popover').children().should('have.length', 11);
    cy.get('#notifications-badge').contains('10');
  });

  it('go to accesions filtered by state when clicking State notification', () => {
    cy.get('#notifications-button').click();

    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as('markRead');
    cy.intercept('POST', '/api/v1/seedbank/values').as('search');
    cy.intercept('GET', '/api/v1/seedbank/notification').as('notification');
    cy.get('#notification4').click().url().should('contain', '/accessions');
    cy.get('#notification4').type('{esc}');
    cy.wait('@markRead');
    cy.wait('@search');
    cy.wait('@notification');
    // cy.get('#simple-popover > .MuiPaper-root').should('be.visible');
    // cy.get('#root').type('{esc}');

    cy.get('#subtitle').should('contain', '1 total');

    cy.get('#filter-state').click();
    cy.get('#filter-list-state').should('be.visible');
    cy.get('#check-Dried').should('have.checked', 'true');
    cy.get('#filter-list-state').type('{esc}');

    cy.get('#notifications-button').click();
    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as('markRead2');
    cy.intercept('POST', '/api/v1/seedbank/values').as('search2');
    cy.intercept('GET', '/api/v1/seedbank/notification?*').as('notification2');
    cy.get('#notification3').click().url().should('contain', '/accessions');
    cy.get('#notification3').click().type('{esc}');
    cy.wait('@markRead2');
    cy.wait('@search2');
    cy.wait('@notification2');

    cy.get('#subtitle').should('contain', '1 total');

    cy.get('#filter-state').click();
    cy.get('#filter-list-state').should('be.visible');
    cy.get('#check-In\\ Storage').should('have.checked', 'true');
    cy.get('#filter-list-state').type('{esc}');
  });

  it('go to accesion page when clicking Date notification', () => {
    cy.get('#notifications-button').click();

    cy.intercept('POST', '/api/v1/seedbank/notification/**/markRead').as('markRead');
    cy.intercept('POST', '/api/v1/seedbank/notification').as('notification');
    cy.get('#notification9').click().url().should('contain', '/accessions/1000');
    cy.wait('@markRead');
    cy.wait('@notification');
  });

  it('has 7 notifications unread after clicking', () => {
    cy.get('#notifications-badge').contains('7');
  });
});
