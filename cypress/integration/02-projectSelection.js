describe('Projects', () => {
  context('Select project', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('#username').type(Cypress.env('user'));
      cy.get('#password').type(Cypress.env('pass'));
      cy.get('#login').click().url().should('contain', '/dashboard');
    });

    it('should have selected first project by default', () => {
      cy.visit('/');
      cy.get('#projects').contains('Pacific Flight')
    });

    it('should change project correctly', () => {
      cy.get('#projects').click()
      cy.get('#2').click()
      cy.get('#projects').contains('Future Forests')
    });
  });
});
