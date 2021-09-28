describe('Onboarding test', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/seedbank/notification').as('notification');
    cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
    cy.visit('/summary');
    cy.wait('@notification');
    cy.wait('@summary');
    Cypress.Cookies.debug(true);
    Cypress.Cookies.preserveOnce('onboarding', 'SESSION');
    Cypress.Cookies.defaults({
      preserve: ['onboarding'],
    });
  });

  it('should accept onboarding', () => {
    cy.get('#acceptTour').click();
    cy.setCookie('onboarding', 'true');
    cy.reload();
    cy.get('#acceptTour').should('not.exist');
  });
});
