/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Withdrawal', () => {
  context('quantity by seed', () => {
    it('should create the accession', () => {
      cy.visit('/accessions/new');
      cy.get('#saveAccession').click();

      cy.get('#menu-processing-drying').click();

      cy.get('#processingMethod').click();
      cy.get('#Count').click();
      cy.get('#seedsCounted').type(300);

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.wait('@getAccession');

      cy.get('#menu-withdrawal')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/withdrawal/);
    });

    it('should display the initial values', () => {
      cy.get('#total-seeds').contains('300');
      cy.get('#seeds-withdrawn').contains('0');
      cy.get('#seeds-available').contains('300');
    });

    it('should create a withdrawal ', () => {
      cy.get('#new-withdrawal-button').click();

      cy.get('#save-withdrawn-button').contains('Withdraw seeds');
      cy.get('#modal-seeds-available').contains('300');

      cy.get('#date-tip').contains(
        'You can schedule a date by selecting a future date.'
      );

      cy.get('#quantityType').contains('seed count');
      cy.get('#quantityType').click();
      cy.get('#weight').should('not.exist');
      cy.get('#count').click();

      cy.get('#quantity').type('50');
      cy.get('#date').clear().type('01/31/2030');
      cy.get('#save-withdrawn-button').contains('Schedule withdrawal');
      cy.get('#date-tip').contains('Scheduling for: January 31st, 2030');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Outreach\\ or\\ Education').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('50');
      cy.get('#seeds-available').contains('250');

      cy.get('#row1-date').contains('Scheduled for');
      cy.get('#row1-date').contains('01/31/2030');
      cy.get('#row1-quantity').contains('50 seeds');
      cy.get('#row1-destination').contains('Panama');
      cy.get('#row1-purpose').contains('Outreach or Education');
      cy.get('#row1-staffResponsible').contains('Carlos');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should(
        'exist'
      );
    });

    it('should edit a withdrawal ', () => {
      cy.get('#row1-edit-button').click();

      cy.get('#save-withdrawn-button').contains('Save changes');
      cy.get('#modal-seeds-available').contains('250');

      cy.get('#quantity').clear().type('10');
      cy.get('#date').clear().type('01/29/2020');
      cy.get('#destination').clear().type('USA');
      cy.get('#purpose').click();
      cy.get('#Research').click();
      cy.get('#notes').clear();
      cy.get('#staffResponsible').clear().type('Leann');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('10');
      cy.get('#seeds-available').contains('290');

      cy.get('#row1-date').contains('01/29/2020');
      cy.get('#row1-quantity').contains('10 seeds');
      cy.get('#row1-destination').contains('USA');
      cy.get('#row1-purpose').contains('Research');
      cy.get('#row1-staffResponsible').contains('Leann');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should(
        'not.exist'
      );
    });

    it('should delete the withdrawal ', () => {
      cy.get('#row1').should('exist');
      cy.get('#row1-edit-button').click();

      cy.get('#modal-seeds-available').contains('290');

      cy.intercept('PUT', '/api/v2/seedbank/accession/**').as('putAccession');
      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#delete-withdrawn-button').click();
      cy.wait('@putAccession');
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('0');
      cy.get('#seeds-available').contains('300');

      cy.get('#row1').should('not.exist');
    });

    it('should do the right math when adding withdrawals', () => {
      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('300');

      cy.get('#quantity').type('50');
      cy.get('#date').clear().type('01/31/2030');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Outreach\\ or\\ Education').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('50');
      cy.get('#seeds-available').contains('250');
      cy.get('#seeds-available').should(
        'have.css',
        'background-color',
        'rgb(73, 80, 87)'
      );

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('250');

      cy.get('#quantity').type('150');
      cy.get('#date').clear().type('01/31/2020');
      cy.get('#destination').type('USA');
      cy.get('#purpose').click();
      cy.get('#Research').click();
      cy.get('#notes').type('Other notes');
      cy.get('#staffResponsible').type('Leann');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('200');
      cy.get('#seeds-available').contains('100');
      cy.get('#seeds-available').should(
        'have.css',
        'background-color',
        'rgb(73, 80, 87)'
      );

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('100');

      cy.get('#quantity').type('100');
      cy.get('#date').clear().type('03/28/2020');
      cy.get('#destination').type('Paris');
      cy.get('#purpose').click();
      cy.get('#Propagation').click();
      cy.get('#staffResponsible').type('Constanza');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('300');
      cy.get('#seeds-available').contains('0');
      cy.get('#seeds-available').should(
        'have.css',
        'background-color',
        'rgb(205, 91, 56)'
      );

      cy.get('#new-withdrawal-button').should(
        'have.css',
        'background-color',
        'rgb(173, 181, 189)'
      );
      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').should('not.exist');
    });
  });

  context('quantity by grams', () => {
    it('should create the accession', () => {
      cy.visit('/accessions/new');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#menu-processing-drying').click();
      cy.get('#processingMethod').click();
      cy.get('#Weight').click();

      cy.get('#subsetWeightGrams').type(100);
      cy.get('#subsetCount').type(10);
      cy.get('#totalWeightGrams').type(100);

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.wait('@getAccession');

      cy.get('#menu-withdrawal').click();
    });

    it('should display the initial values', () => {
      cy.get('#total-seeds').contains('10');
      cy.get('#seeds-withdrawn').contains('0');
      cy.get('#seeds-available').contains('10');
    });

    it('should create a withdrawal ', () => {
      cy.get('#new-withdrawal-button').click();

      cy.get('#modal-seeds-available').contains('10');

      cy.get('#quantityType').contains('seed count');
      cy.get('#quantityType').click();
      cy.get('#weight').click();
      cy.get('#quantityType').contains('g (gram)');

      cy.get('#quantity').type('20');
      cy.get('#date').clear().type('01/31/2030');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Outreach\\ or\\ Education').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('2');
      cy.get('#seeds-available').contains('8');

      cy.get('#row1-date').contains('Scheduled for');
      cy.get('#row1-date').contains('01/31/2030');
      cy.get('#row1-quantity').contains('20g');

      cy.get('#row1-destination').contains('Panama');
      cy.get('#row1-purpose').contains('Outreach or Education');
      cy.get('#row1-staffResponsible').contains('Carlos');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should(
        'exist'
      );
    });

    it('should edit a withdrawal ', () => {
      cy.get('#row1-edit-button').click();

      cy.get('#modal-seeds-available').contains('8');

      cy.get('#quantityType').click();
      cy.get('#weight').click();

      cy.get('#quantity').clear().type('30');
      cy.get('#date').clear().type('01/29/2020');
      cy.get('#destination').clear().type('USA');
      cy.get('#purpose').click();
      cy.get('#Research').click();
      cy.get('#notes').clear();
      cy.get('#staffResponsible').clear().type('Leann');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('3');
      cy.get('#seeds-available').contains('7');

      cy.get('#row1-date').contains('01/29/2020');
      cy.get('#row1-quantity').contains('30g');

      cy.get('#row1-destination').contains('USA');
      cy.get('#row1-purpose').contains('Research');
      cy.get('#row1-staffResponsible').contains('Leann');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should(
        'not.exist'
      );
    });

    it('should do the right math when adding withdrawals', () => {
      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('7');

      cy.get('#quantity').type('3');
      cy.get('#date').clear().type('01/31/2030');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Outreach\\ or\\ Education').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('6');
      cy.get('#seeds-available').contains('4');
      cy.get('#seeds-available').should(
        'have.css',
        'background-color',
        'rgb(73, 80, 87)'
      );

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('4');

      cy.get('#quantity').type('1');
      cy.get('#date').clear().type('01/31/2020');
      cy.get('#destination').type('USA');
      cy.get('#purpose').click();
      cy.get('#Research').click();
      cy.get('#notes').type('Other notes');
      cy.get('#staffResponsible').type('Leann');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('7');
      cy.get('#seeds-available').contains('3');
      cy.get('#seeds-available').should(
        'have.css',
        'background-color',
        'rgb(73, 80, 87)'
      );

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('3');

      cy.get('#quantityType').click();
      cy.get('#weight').click();
      cy.get('#quantity').type('27');
      cy.get('#date').clear().type('03/28/2020');
      cy.get('#destination').type('Paris');
      cy.get('#purpose').click();
      cy.get('#Propagation').click();
      cy.get('#staffResponsible').type('Constanza');

      cy.intercept('GET', 'api/v2/seedbank/accession/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('10');
      cy.get('#seeds-available').contains('0');
      cy.get('#seeds-available').should(
        'have.css',
        'background-color',
        'rgb(205, 91, 56)'
      );

      cy.get('#new-withdrawal-button').should(
        'have.css',
        'background-color',
        'rgb(173, 181, 189)'
      );
      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').should('not.exist');
    });

    it('should display the records in the right order', () => {
      // by date
      cy.get('#row1-date').contains('01/29/2020');
      cy.get('#row2-date').contains('01/31/2020');
      cy.get('#row3-date').contains('03/28/2020');
      cy.get('#row4-date').contains('Scheduled for');
      cy.get('#row4-date').contains('01/31/2030');

      // by date descending
      cy.get('#table-header-date').click();
      cy.get('#row1-date').contains('Scheduled for');
      cy.get('#row1-date').contains('01/31/2030');
      cy.get('#row2-date').contains('03/28/2020');
      cy.get('#row3-date').contains('01/31/2020');
      cy.get('#row4-date').contains('01/29/2020');

      // by quantity
      cy.get('#table-header-quantity').click();
      cy.get('#row1-quantity').contains('27g');
      cy.get('#row2-quantity').contains('30g');
      cy.get('#row3-quantity').contains('1 seeds');
      cy.get('#row4-quantity').contains('3 seeds');

      // by destination
      cy.get('#table-header-destination').click();
      cy.get('#row1-destination').contains('Panama');
      cy.get('#row2-destination').contains('Paris');
      cy.get('#row3-destination').contains('USA');
      cy.get('#row4-destination').contains('USA');

      // by Purpose, descending
      cy.get('#table-header-purpose').click();
      cy.get('#table-header-purpose').click();
      cy.get('#row1-purpose').contains('Research');
      cy.get('#row2-purpose').contains('Research');
      cy.get('#row3-purpose').contains('Propagation');
      cy.get('#row4-purpose').contains('Outreach or Education');

      // by staff, descending
      cy.get('#table-header-staffResponsible').click();
      cy.get('#table-header-staffResponsible').click();
      cy.get('#row1-staffResponsible').contains('Leann');
      cy.get('#row2-staffResponsible').contains('Leann');
      cy.get('#row3-staffResponsible').contains('Constanza');
      cy.get('#row4-staffResponsible').contains('Carlos');
    });
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('11');
      cy.get('#sessions-change').contains('267% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('3');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('2');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('0 accessions');
      cy.get('#update-row-Withdrawn').contains('2 accessions');
    });
  });
});
