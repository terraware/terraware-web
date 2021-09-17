describe('Species', () => {
  it('should exists species created when modifying', () => {
    cy.visit('/species');
    cy.get('#row2-name').should('contain','Kousa Dogwoord Modified');
    cy.get('#row3-name').should('contain','Kousa Dogwoord New');
  });

  it('should create a new species', () => {
    cy.get('#new-species').click();
    cy.get('#name').clear().type('New specie');

    cy.intercept('POST', 'api/v1/species').as('createSpecies');
    cy.get('#saveSpecie').click();
    cy.wait('@createSpecies');
    

    cy.get('#row4-name').should('contain','New specie');
  });

  it('should edit a species', () => {
    cy.get('#row2').click();

    cy.get('#name').type('2');
    cy.intercept('PUT', 'api/v1/species/*').as('updateSpecies');
    cy.get('#saveSpecie').click();
    cy.wait('@updateSpecies');
    

    cy.get('#row2-name').should('contain','Kousa Dogwoord Modified2');
  });
});
