describe('Lab', () => {
  it('should not create Lab menu if not selecting any test', () => {
    cy.visit('/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#lab').should('not.exist');
  });
  it('should create the accession with lab test and navigate to lab section', () => {
    cy.visit('/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#menu-processing-drying').click();
    cy.get('#Lab').click();
    cy.get('#quantity').type('1000');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#lab')
      .click()
      .url()
      .should('match', /accessions\/[A-Za-z0-9]+\/lab/);
  });
  it('should create a new test', () => {
    cy.get('#newTest').click();
    cy.get('#seedsRemaining').should('have.value', 1000);
    cy.get('#startDate').type('02/09/2021');
    cy.get('#seedType').click();
    cy.get('#Stored').click();
    cy.get('#substrate').click();
    cy.get('#Paper\\ Petri\\ Dish').click();
    cy.get('#treatment').click();
    cy.get('#Scarify').click();
    cy.get('#seedsSown').type('100');
    cy.get('#seedsRemaining').should('have.value', '900');
    cy.get('#notes').type('A lab test note');
    cy.get('#staffResponsible').type('Constanza');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('#row1-startDate').should('contain', '02/09/2021');
    cy.get('#row1-seedType').should('contain', 'Stored');
    cy.get('#row1-substrate').should('contain', 'Paper Petri Dish');
    cy.get('#row1-treatment').should('contain', 'Scarify');
    cy.get('#row1-seedsSown').should('contain', '100');
    cy.get('#row1-staffResponsible').should('contain', 'Constanza');
    cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
  });

  it('should modify test', () => {
    cy.get('#row1').click();
    cy.get('#substrate').click();
    cy.get('#Nursery\\ Media').click();
    cy.get('#notes').clear();

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('#row1-startDate').should('contain', '02/09/2021');
    cy.get('#row1-seedType').should('contain', 'Stored');
    cy.get('#row1-substrate').should('contain', 'Nursery Media');
    cy.get('#row1-treatment').should('contain', 'Scarify');
    cy.get('#row1-seedsSown').should('contain', '100');
    cy.get('#row1-staffResponsible').should('contain', 'Constanza');
    cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
  });

  it('should create another test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('02/12/2021');
    cy.get('#seedType').click();
    cy.get('#Stored').click();
    cy.get('#substrate').click();
    cy.get('#Agar\\ Petri\\ Dish').click();
    cy.get('#treatment').click();
    cy.get('#Soak').click();
    cy.get('#seedsSown').type('200');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');
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

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');
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
    cy.get('#row2-seedType').contains('Stored');
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
    cy.get('#row2-seedsSown').contains('100');
    cy.get('#row3-seedsSown').contains('200');
  });

  it('should delete test', () => {
    cy.get('#row3').click();

    cy.intercept('PUT', '/api/v1/seedbank/accession/**').as('putAccession');
    cy.intercept('GET', '/api/v1/seedbank/accession/**').as('getAccession');
    cy.get('#deleteTest').click();
    cy.wait('@putAccession');
    cy.wait('@getAccession');

    cy.get('#row3').should('not.exist');
  });

  it('should add germination entry and create bar in graph', () => {
    cy.get('#row2-expand').click();
    cy.get('#newEntry').click();

    cy.intercept('PUT', '/api/v1/seedbank/accession/**').as('putAccession');
    cy.intercept('GET', '/api/v1/seedbank/accession/**').as('getAccession');
    cy.get('#seedsGerminated').type('10');
    cy.get('#recordingDate').clear().type('02/09/2021');

    cy.get('#saveGermination').click();
    cy.wait('@putAccession');
    cy.wait('@getAccession');

    cy.get('#row2-startDate').should('contain', '02/09/2021');
    cy.get('#row2-seedType').should('contain', 'Stored');
    cy.get('#row2-substrate').should('contain', 'Nursery Media');
    cy.get('#row2-treatment').should('contain', 'Scarify');
    cy.get('#row2-seedsSown').should('contain', '100');
    cy.get('#row2-staffResponsible').should('contain', 'Constanza');
    cy.get('#row2-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');

    cy.get('#mostRecentViabiliy').contains('10%');
    cy.get('#lab-table').scrollTo('left');
    cy.get('#totalSeedsGerminated').contains('10 (10.0%)');

    cy.get('#row2-details #row1-seedsGerminated').should('contain', '10 seeds germinated');
    cy.get('#row2-details #row1-recordingDate').should('contain', '02/09/2021');
    cy.get('#myChart').should('exist');
  });

  it('should add other germination entry and create a new bar on graph', () => {
    cy.get('#totalSeedsGerminated').should('be.visible');
    cy.get('#newEntry').click();
    cy.get('.MuiDialogTitle-root').should('be.visible');

    cy.intercept('PUT', '/api/v1/seedbank/accession/**').as('putAccession');
    cy.intercept('GET', '/api/v1/seedbank/accession/**').as('getAccession');
    cy.get('#seedsGerminated').clear().type('15');
    cy.get('#recordingDate').clear().type('05/09/2021');

    cy.get('#saveGermination').click();
    cy.wait('@putAccession');
    cy.wait('@getAccession');

    cy.get('#row2-startDate').should('contain', '02/09/2021');
    cy.get('#row2-seedType').should('contain', 'Stored');
    cy.get('#row2-substrate').should('contain', 'Nursery Media');
    cy.get('#row2-treatment').should('contain', 'Scarify');
    cy.get('#row2-seedsSown').should('contain', '100');
    cy.get('#row2-staffResponsible').should('contain', 'Constanza');
    cy.get('#row2-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');

    cy.get('#mostRecentViabiliy').contains('25%');
    cy.get('#row2-expand').click();
    cy.get('#totalSeedsGerminated').contains('25 (25.0%)');

    cy.get('#row2-details #row2-seedsGerminated').contains('15 seeds germinated');
    cy.get('#row2-details #row2-recordingDate').contains('05/09/2021');
    cy.get('#myChart').should('exist');
  });

  it('should modify entry', () => {
    cy.get('#row2-details #row2').click();

    cy.intercept('PUT', '/api/v1/seedbank/accession/**').as('putAccession');
    cy.intercept('GET', '/api/v1/seedbank/accession/**').as('getAccession');
    cy.get('#seedsGerminated').clear().type('25');

    cy.get('#saveGermination').click();
    cy.wait('@putAccession');
    cy.wait('@getAccession');

    cy.get('#row2-startDate').should('contain', '02/09/2021');
    cy.get('#row2-seedType').should('contain', 'Stored');
    cy.get('#row2-substrate').should('contain', 'Nursery Media');
    cy.get('#row2-treatment').should('contain', 'Scarify');
    cy.get('#row2-seedsSown').should('contain', '100');
    cy.get('#row2-staffResponsible').should('contain', 'Constanza');
    cy.get('#row2-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');

    cy.get('#mostRecentViabiliy').contains('35%');
    cy.get('#row2-expand').click();

    cy.get('#row2-details #row2-seedsGerminated').contains('25 seeds germinated');
    cy.get('#row2-details #row2-recordingDate').contains('05/09/2021');
    cy.get('#myChart').should('exist');
  });

  it('should delete entry', () => {
    cy.get('#row2-details #row2').click();

    cy.intercept('PUT', '/api/v1/seedbank/accession/**').as('putAccession');
    cy.intercept('GET', '/api/v1/seedbank/accession/**').as('getAccession');
    cy.get('#deleteGermination').click();
    cy.wait('@putAccession');
    cy.wait('@getAccession');

    cy.get('#row2-startDate').should('contain', '02/09/2021');
    cy.get('#row2-seedType').should('contain', 'Stored');
    cy.get('#row2-substrate').should('contain', 'Nursery Media');
    cy.get('#row2-treatment').should('contain', 'Scarify');
    cy.get('#row2-seedsSown').should('contain', '100');
    cy.get('#row2-staffResponsible').should('contain', 'Constanza');
    cy.get('#row2-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');

    cy.get('#mostRecentViabiliy').contains('10%');

    cy.get('#row2-expand').click();
    cy.get('#row2-details #row2-seedsGerminated').should('not.exist');
  });

  it('should add cut test', () => {
    cy.get('#cutTest #row1-edit').click();

    cy.get('#cutTestSeedsFilled').type('15');
    cy.get('#cutTestSeedsEmpty').type('50');
    cy.get('#cutTestSeedsCompromised').type('10');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveCutTest').click();
    cy.wait('@getAccession');

    cy.get('#row1-filledSeeds').should('contain', '15');
    cy.get('#row1-emptySeeds').should('contain', '50');
    cy.get('#row1-compromisedSeeds').should('contain', '10');
  });

  it('should modify cut test', () => {
    cy.get('#cutTest #row1-edit').click();

    cy.get('#cutTestSeedsFilled').clear().type('500');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveCutTest').click();
    cy.wait('@getAccession');

    cy.get('#row1-filledSeeds').should('contain', '500');
    cy.get('#row1-emptySeeds').should('contain', '50');
    cy.get('#row1-compromisedSeeds').should('contain', '10');
  });

  it('should show schedule testing box when creating a future test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('02/09/3021');
    cy.get('#seedsSown').type('25');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('#scheduledForTesting').should('contain', '25 Seeds');
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary/*').as('summary');
      cy.visit('/summary');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('8');
      cy.get('#sessions-change').contains('167% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('6');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('2');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('1 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});
