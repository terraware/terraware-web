describe('Searchbar', () => {
  context('search', () => {
    it('should redirect the user to the correct page', () => {
      cy.visit('/accessions');
      cy.get('#newAccession').click().url().should('contain', '/accessions/new');
      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#header-accessionNumber').then(($accessionNumberElement) => {
        const accessionNumber = $accessionNumberElement.text();

        cy.url().then((url) => {
          cy.visit('/seeds-dashboard');
          cy.get('#search-bar').type(accessionNumber);
          cy.get('#search-bar-option-0').click().url().should('eq', url);
        });
      });
    });
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary/*').as('summary');
      cy.visit('/seeds-dashboard');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('11');
      cy.get('#sessions-change').contains('267% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('6');
      cy.get('#species-change').contains('200% since last week');
      cy.get('#species-arrow-increase').should('exist');

      cy.get('#families-current').contains('2');
      cy.get('#families-change').contains('100% since last week');
      cy.get('#families-arrow-increase').should('exist');

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('1 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});
