describe('Help', () => {
  describe('Homepage', () => {
    beforeEach(() => {
      cy.visit('/home');
    });

    it('navbar should have all elements', () => {
      cy.get('.MuiToolbar-root').children().should('have.length', 1);
    });

    it('navigate to help page', () => {
      cy.get('#help-button-link')
        .should('have.attr', 'href', '/help')
        .should('have.attr', 'target', '_blank');
      cy.request(Cypress.config().baseUrl + '/help')
        .its('status')
        .should('eq', 200);
    });
  });

  describe('Help page', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('onboarding');
      cy.visit('/help');
    });

    it('navbar should only have icon', () => {
      cy.get('.MuiToolbar-root').children().should('have.length', 1);
      //cy.get('#tf-icon').should('exist');
    });

    it.skip('clear onboarding cookie and navigate to home page', () => {
      cy.setCookie('onboarding', 'true');
      cy.getCookie('onboarding').should('have.property', 'value', 'true');
      cy.get('#letsDoIt-button-link')
        .should('have.attr', 'href', '/')
        .should('have.attr', 'target', '_blank');

      cy.get('#letsDoIt-button-link').click();

      cy.getCookie('onboarding').should('have.property', 'value', 'false');
    });

    it.skip('should not show onboarding', () => {
      cy.getCookie('onboarding').should('have.property', 'value', 'false');
    });
  });
});
