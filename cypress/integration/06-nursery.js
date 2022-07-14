describe('Nursery', () => {
  it('should not create Germination menu if not selecting any test', () => {
    cy.visit('/accessions');
    cy.get('#newAccession').click();
    cy.get('#seedBank').click();
    cy.get('ul')
      .children()
      .each(($el, index) => {
        if (index === 0) $el.click();
      });
    cy.get('#select-seed-bank').click().url().should('contain', '/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');

    cy.get('#nursery').should('not.exist');
  });
  it('should create the accession with nursery test and navigate to nursery section', () => {
    cy.visit('/accessions');
    cy.get('#newAccession').click();
    cy.get('#seedBank').click();
    cy.get('ul')
      .children()
      .each(($el, index) => {
        if (index === 0) $el.click();
      });
    cy.get('#select-seed-bank').click().url().should('contain', '/accessions/new');
    cy.get('#saveAccession').click();
    cy.get('#snackbar').contains('Accession saved');
    cy.get('#checkIn').click();

    cy.get('#menu-processing-drying').click();
    cy.get('#quantity').type('500');

    cy.get('#Nursery').click();

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#nursery')
      .click()
      .url()
      .should('match', /accessions\/[A-Za-z0-9]+\/nursery/);
  });
  it('should create a new test', () => {
    cy.get('#newTest').click();
    cy.get('#seedsRemaining').should('have.value', 500);
    cy.get('#startDate').type('2021-02-09');
    cy.get('#seedType').click();
    cy.get('#Stored').click();
    cy.get('#substrate').click();
    cy.get('#Paper\\ Petri\\ Dish').click();
    cy.get('#treatment').click();
    cy.get('#Scarify').click();
    cy.get('#seedsSown').type('100');
    cy.get('#seedsRemaining').should('have.value', '400');
    cy.get('#seedsGerminated').type('50');
    cy.get('#viability').should('have.value', '50.0');
    cy.get('#recordingDate').type('2021-02-09');
    cy.get('#notes').type('A nursery test note');
    cy.get('#staffResponsible').type('Constanza');
    cy.get('#saveTest').should('contain', 'Create Test');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 1);
    cy.get('#mostRecentViabiliy').should('contain', '50%');

    cy.get('#row1-startDate').should('contain', '2021-02-09');
    cy.get('#row1-seedType').should('contain', 'Stored');
    cy.get('#row1-substrate').should('contain', 'Paper Petri Dish');
    cy.get('#row1-treatment').should('contain', 'Scarify');
    cy.get('#row1-seedsSown').should('contain', '100');
    cy.get('#row1-seedsGerminated').should('contain', '50');
    cy.get('#row1-recordingDate').should('contain', '2021-02-09');
    cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
  });

  it('should modify test', () => {
    cy.get('#row1').click({ force: true });
    cy.get('#substrate').click();
    cy.get('#Nursery\\ Media').click();
    cy.get('#seedsGerminated').clear().type('70');
    cy.get('#recordingDate').clear().type('2021-02-10');
    cy.get('#notes').clear();
    cy.get('#saveTest').should('contain', 'Save Changes');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('#mostRecentViabiliy').should('contain', '70%');

    cy.get('#row1-startDate').should('contain', '2021-02-09');
    cy.get('#row1-seedType').should('contain', 'Stored');
    cy.get('#row1-substrate').should('contain', 'Nursery Media');
    cy.get('#row1-treatment').should('contain', 'Scarify');
    cy.get('#row1-seedsSown').should('contain', '100');
    cy.get('#row1-seedsGerminated').should('contain', '70');
    cy.get('#row1-recordingDate').should('contain', '2021-02-10');
    cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
  });

  it('should create another test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('2021-02-12');
    cy.get('#seedType').click();
    cy.get('#Fresh').click();
    cy.get('#substrate').click();
    cy.get('#Agar\\ Petri\\ Dish').click();
    cy.get('#treatment').click();
    cy.get('#Soak').click();
    cy.get('#seedsSown').type('200');
    cy.get('#seedsGerminated').type('100');
    cy.get('#recordingDate').type('2021-02-15');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 2);
  });

  it('should create another test', () => {
    cy.get('#newTest').click();
    cy.get('#startDate').type('2021-02-01');
    cy.get('#seedType').click();
    cy.get('#Fresh').click();
    cy.get('#substrate').click();
    cy.get('#Other').click();
    cy.get('#treatment').click();
    cy.get('#Other').click();
    cy.get('#seedsSown').type('50');
    cy.get('#seedsGerminated').type('45');
    cy.get('#recordingDate').type('2021-01-25');

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#saveTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 3);
  });

  it('should display the records in the right order', () => {
    cy.get('#row1-startDate').contains('2021-02-09');
    cy.get('#row2-startDate').contains('2021-02-12');
    cy.get('#row3-startDate').contains('2021-02-01');

    // by start date
    cy.get('#table-header-startDate').click();
    cy.get('#row1-startDate').contains('2021-02-01');
    cy.get('#row2-startDate').contains('2021-02-09');
    cy.get('#row3-startDate').contains('2021-02-12');

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
    cy.get('#row2-seedsSown').contains('100');
    cy.get('#row3-seedsSown').contains('200');

    // by germinated
    cy.get('#table-header-seedsGerminated').click();
    cy.get('#row1-seedsGerminated').contains('45');
    cy.get('#row2-seedsGerminated').contains('70');
    cy.get('#row3-seedsGerminated').contains('100');

    // by recording date
    cy.get('#table-header-recordingDate').click();
    cy.get('#row1-recordingDate').contains('2021-01-25');
    cy.get('#row2-recordingDate').contains('2021-02-10');
    cy.get('#row3-recordingDate').contains('2021-02-15');
  });

  it('should delete test', () => {
    cy.get('#row2').click();

    cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
    cy.get('#deleteTest').click();
    cy.wait('@getAccession');

    cy.get('.MuiTableBody-root').children().should('have.length', 2);
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
      cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');
      cy.visit('/seeds-dashboard');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('10');
      cy.get('#sessions-change').contains('233% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('4');
      cy.get('#species-change').contains('100% since last week');
      cy.get('#species-arrow-increase').should('exist');

      cy.get('#families-current').contains('1');
      cy.get('#families-change').contains('0% since last week');
      cy.get('#families-arrow-increase').should('exist');

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('1 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});
