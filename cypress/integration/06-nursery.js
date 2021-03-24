/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Nursery', () => {
  it('should not create Germination menu if not selecting any test', () => {
    cy.visit('/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#nursery').should('not.exist');
  });
  it('should create the accession with nursery test and navigate to nursery section', () => {
    cy.visit('/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#menu-processing-drying').click();
    cy.get('#Nursery').click();

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#nursery')
      .click()
      .url()
      .should('match', /accessions\/[A-Za-z0-9]+\/nursery/);
  });
  it('should create a new test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('02/09/2021');
    cy.get('#endDate').type('03/22/2021');
    cy.get('#seedType').click();
    cy.get('#Stored').click();
    cy.get('#substrate').click();
    cy.get('#Paper\\ Petri\\ Dish').click();
    cy.get('#treatment').click();
    cy.get('#Scarify').click();
    cy.get('#seedsSown').type('100');
    cy.get('#seedsGerminated').type('50');
    cy.get('#recordingDate').type('02/09/2021');
    cy.get('#notes').type('A nursery test note');
    cy.get('#staffResponsible').type('Constanza');
    cy.get('#saveTest').should('contain', 'Create test');

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 1);
    cy.get('#totalViabilityPercent').should('contain', '50%');

    cy.get('#row1-startDate').should('contain','02/09/2021');
    cy.get('#row1-endDate').should('contain','03/22/2021');
    cy.get('#row1-seedType').should('contain','Stored');
    cy.get('#row1-substrate').should('contain','Paper Petri Dish');
    cy.get('#row1-treatment').should('contain','Scarify');
    cy.get('#row1-seedsSown').should('contain','100');
    cy.get('#row1-seedsGerminated').should('contain','50');
    cy.get('#row1-recordingDate').should('contain','02/09/2021');
    cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
  });

  it('should modify test', () => {
    cy.get('#row1-edit-button').click();
    cy.get('#substrate').click();
    cy.get('#Nursery\\ Media').click();
    cy.get('#seedsGerminated').clear().type('70');
    cy.get('#recordingDate').clear().type('02/10/2021');
    cy.get('#notes').clear();
    cy.get('#saveTest').should('contain', 'Save changes');

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('#totalViabilityPercent').should('contain', '70%');

    cy.get('#row1-startDate').should('contain','02/09/2021');
    cy.get('#row1-seedType').should('contain','Stored');
    cy.get('#row1-substrate').should('contain','Nursery Media');
    cy.get('#row1-treatment').should('contain','Scarify');
    cy.get('#row1-seedsSown').should('contain','100');
    cy.get('#row1-seedsGerminated').should('contain','70');
    cy.get('#row1-recordingDate').should('contain','02/10/2021');
    cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
  });

  it('should create another test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('02/12/2021');
    cy.get('#seedType').click();
    cy.get('#Fresh').click();
    cy.get('#substrate').click();
    cy.get('#Agar\\ Petri\\ Dish').click();
    cy.get('#treatment').click();
    cy.get('#Soak').click();
    cy.get('#seedsSown').type('200');
    cy.get('#seedsGerminated').type('100');
    cy.get('#recordingDate').type('02/15/2021');

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 2);
  });

  it('should create another test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('02/01/2021');
    cy.get('#seedType').click();
    cy.get('#Fresh').click();
    cy.get('#substrate').click();
    cy.get('#Other').click();
    cy.get('#treatment').click();
    cy.get('#Other').click();
    cy.get('#seedsSown').type('50');
    cy.get('#seedsGerminated').type('45');
    cy.get('#recordingDate').type('01/25/2021');

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 3);
  });

  it('should display the records in the right order', () => {
    cy.get('#row1-startDate').contains('02/09/2021');
    cy.get('#row2-startDate').contains('02/12/2021');
    cy.get('#row3-startDate').contains('02/01/2021');

    // by start date
    cy.get('#table-header-startDate').click();
    cy.get('#row1-startDate').contains('02/01/2021');
    cy.get('#row2-startDate').contains('02/09/2021');
    cy.get('#row3-startDate').contains('02/12/2021');

    // by seed type
    cy.get('#table-header-seedType').click();
    cy.get('#row1-seedType').contains('Fresh');
    cy.get('#row2-seedType').contains('Fresh');
    cy.get('#row3-seedType').contains('Stored');

    // by substrate
    cy.get('#table-header-substrate').click();
    cy.get('#row1-substrate').contains('Agar Petri Dish');
    cy.get('#row2-substrate').contains('Nursery Media');
    cy.get('#row3-substrate').contains('Other');

    // by Treatment
    cy.get('#table-header-treatment').click();
    cy.get('#row1-treatment').contains('Other');
    cy.get('#row2-treatment').contains('Scarify');
    cy.get('#row3-treatment').contains('Soak');

    // by sown
    cy.get('#table-header-seedsSown').click();
    cy.get('#row1-seedsSown').contains('50');
    cy.get('#row2-seedsSown').contains(
      '100'
    );
    cy.get('#row3-seedsSown').contains(
      '200'
    );

    // by germinated
    cy.get('#table-header-seedsGerminated').click();
    cy.get('#row1-seedsGerminated').contains('45');
    cy.get('#row2-seedsGerminated').contains('70');
    cy.get('#row3-seedsGerminated').contains(
      '100'
    );

    // by recording date
    cy.get('#table-header-recordingDate').click();
    cy.get('#row1-recordingDate').contains('01/25/2021');
    cy.get('#row2-recordingDate').contains('02/10/2021');
    cy.get('#row3-recordingDate').contains('02/15/2021');
  });

  it('should delete test', () => {
    cy.get('#row2-edit-button').click();

    cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
    cy.get('#deleteTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 2);
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('10');
      cy.get('#sessions-change').contains('233% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('3');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('2');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('0 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});
