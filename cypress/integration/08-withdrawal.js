describe('Withdrawal', () => {
  context('quantity by seed', () => {
    it('should create the accession', () => {
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
      cy.get('#checkIn').click();

      cy.get('#menu-processing-drying').click();

      cy.get('#processingMethod').click();
      cy.get('#Count').click();
      cy.get('#quantity').type(300);

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.wait('@getAccession');

      cy.get('#menu-withdrawal')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/withdrawal/);
    });

    it('should display the initial values', () => {
      cy.get('#total-seeds').contains('0');
      cy.get('#seeds-withdrawn').contains('0');
      cy.get('#seeds-available').contains('300');
    });

    it('should create a withdrawal ', () => {
      cy.get('#new-withdrawal-button').click();

      cy.get('#save-withdrawn-button').contains('Withdraw seeds');
      cy.get('#modal-seeds-available').contains('300');

      cy.get('#date-tip').contains('Schedule a date by selecting a future date.');

      cy.get('#units').contains('seed count');
      cy.get('#units').click();
      cy.get('#Grams').should('not.exist');
      cy.get('#Seeds').click();

      cy.get('#remaining').should('have.value', '300');
      cy.get('#quantity').type('50');
      cy.get('#remaining').should('have.value', '250');
      cy.get('#date').clear().type('2030-01-31');
      cy.get('#save-withdrawn-button').contains('Schedule Withdrawal');
      cy.get('#date-tip').contains('Scheduling for: January 31st, 2030');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('50');
      cy.get('#seeds-available').contains('250');

      cy.get('#row1-date').contains('Scheduled for');
      cy.get('#row1-date').contains('2030-01-31');
      cy.get('#row1-quantity').contains('50 Seeds');
      cy.get('#row1-destination').contains('Panama');
      cy.get('#row1-purpose').contains('Other');
      cy.get('#row1-staffResponsible').contains('Carlos');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
    });

    it('should edit a withdrawal ', () => {
      cy.get('#row1').click();

      cy.get('#save-withdrawn-button').contains('Save Changes');
      cy.get('#modal-seeds-available').contains('250');

      cy.get('#remaining').should('have.value', '250');
      cy.get('#quantity').clear();
      cy.get('#remaining').should('have.value', '300');
      cy.get('#quantity').type('10');
      cy.get('#remaining').should('have.value', '290');
      cy.get('#date').clear().type('2020-01-29');
      cy.get('#destination').clear().type('USA');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').clear();
      cy.get('#staffResponsible').clear().type('Leann');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('10');
      cy.get('#seeds-available').contains('290');

      cy.get('#row1-date').contains('2020-01-29');
      cy.get('#row1-quantity').contains('10 Seeds');
      cy.get('#row1-destination').contains('USA');
      cy.get('#row1-purpose').contains('Other');
      cy.get('#row1-staffResponsible').contains('Leann');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
    });

    it('should delete the withdrawal ', () => {
      cy.get('#row1').should('exist');
      cy.get('#row1').click();

      cy.get('#modal-seeds-available').contains('290');

      cy.intercept('PUT', '/api/v1/seedbank/accessions/**').as('putAccession');
      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
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
      cy.get('#remaining').should('have.value', '250');
      cy.get('#date').clear().type('2030-01-31');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('50');
      cy.get('#seeds-available').contains('250');
      cy.get('#seeds-available').should('have.css', 'background-color', 'rgb(73, 80, 87)');

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('250');

      cy.get('#remaining').should('have.value', '250');
      cy.get('#quantity').type('150');
      cy.get('#remaining').should('have.value', '100');
      cy.get('#date').clear().type('2020-01-31');
      cy.get('#destination').type('USA');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').type('Other notes');
      cy.get('#staffResponsible').type('Leann');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('150');
      cy.get('#seeds-available').contains('100');
      cy.get('#seeds-available').should('have.css', 'background-color', 'rgb(73, 80, 87)');

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('100');

      cy.get('#remaining').should('have.value', '100');
      cy.get('#withdraw_remaining').click();
      cy.get('#quantity').should('have.value', '100');
      cy.get('#remaining').should('have.value', '0');
      cy.get('#date').clear().type('2020-03-28');
      cy.get('#destination').type('Paris');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#staffResponsible').type('Constanza');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('250');
      cy.get('#seeds-available').contains('0');
      cy.get('#seeds-available').should('have.css', 'background-color', 'rgb(205, 91, 56)');

      cy.get('#new-withdrawal-button').should('have.css', 'background-color', 'rgb(173, 181, 189)');
      cy.get('#new-withdrawal-button').should('have.class', 'Mui-disabled');
    });
  });

  context('quantity by grams', () => {
    it('should create the accession', () => {
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
      cy.get('#processingMethod').click();
      cy.get('#Weight').click();

      cy.get('#subsetWeight').type(100);
      cy.get('#subsetCount').type(10);
      cy.get('#quantity').type(100);

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.wait('@getAccession');

      cy.get('#menu-withdrawal').click();
    });

    it('should display the initial values', () => {
      cy.get('#total-seeds').contains('0');
      cy.get('#seeds-withdrawn').contains('0');
      cy.get('#seeds-available').contains('10');
    });

    it('should create a withdrawal ', () => {
      cy.get('#new-withdrawal-button').click();

      cy.get('#modal-seeds-available').contains('10');

      cy.get('#units').click();
      cy.get('#Grams').click();
      cy.get('#units').contains('g (grams)');

      cy.get('#withdrawnQuantity #quantity').type('20');
      cy.get('#remainingQuantity #quantity').type('80');
      cy.get('#date').clear().type('2030-01-31');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('2');
      cy.get('#seeds-available').contains('8');

      cy.get('#row1-date').contains('Scheduled for');
      cy.get('#row1-date').contains('2030-01-31');
      cy.get('#row1-quantity').contains('20 Grams');

      cy.get('#row1-destination').contains('Panama');
      cy.get('#row1-purpose').contains('Other');
      cy.get('#row1-staffResponsible').contains('Carlos');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
    });

    it('should edit a withdrawal ', () => {
      cy.get('#row1').click();

      cy.get('#modal-seeds-available').contains('8');

      cy.get('#units').click();
      cy.get('#Grams').click();

      cy.get('#withdrawnQuantity #quantity').clear().type('30');
      cy.get('#remainingQuantity #quantity').clear().type('7');
      cy.get('#date').clear().type('2020-01-29');
      cy.get('#destination').clear().type('USA');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').clear();
      cy.get('#staffResponsible').clear().type('Leann');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('3');
      cy.get('#seeds-available').contains('7');

      cy.get('#row1-date').contains('2020-01-29');
      cy.get('#row1-quantity').contains('30 Grams');

      cy.get('#row1-destination').contains('USA');
      cy.get('#row1-purpose').contains('Other');
      cy.get('#row1-staffResponsible').contains('Leann');
      cy.get('#row1-notes > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
    });

    it('should do the right math when adding withdrawals', () => {
      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('7');

      cy.get('#withdrawnQuantity #quantity').type('3');
      cy.get('#remainingQuantity #quantity').type('6');
      cy.get('#date').clear().type('2030-01-31');
      cy.get('#destination').type('Panama');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').type('Some notes');
      cy.get('#staffResponsible').type('Carlos');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('93');
      cy.get('#seeds-available').contains('6');
      cy.get('#seeds-available').should('have.css', 'background-color', 'rgb(73, 80, 87)');

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('6');

      cy.get('#withdrawnQuantity #quantity').type('1');
      cy.get('#remainingQuantity #quantity').type('5');
      cy.get('#date').clear().type('2020-01-31');
      cy.get('#destination').type('USA');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#notes').type('Other notes');
      cy.get('#staffResponsible').type('Leann');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('94');
      cy.get('#seeds-available').contains('5');
      cy.get('#seeds-available').should('have.css', 'background-color', 'rgb(73, 80, 87)');

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('5');

      cy.get('#units').click();
      cy.get('#Grams').click();
      cy.get('#withdrawnQuantity #quantity').type('77');
      cy.get('#remainingQuantity #quantity').type('2');
      cy.get('#date').clear().type('2020-03-28');
      cy.get('#destination').type('Paris');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#staffResponsible').type('Constanza');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('97');
      cy.get('#seeds-available').contains('2');

      cy.get('#new-withdrawal-button').click();
      cy.get('#modal-seeds-available').contains('2');

      cy.get('#units').click();
      cy.get('#Grams').click();
      cy.get('#withdrawnQuantity #quantity').type('70');
      cy.get('#remainingQuantity #quantity').type('0');
      cy.get('#date').clear().type('2020-03-28');
      cy.get('#destination').type('Paris');
      cy.get('#purpose').click();
      cy.get('#Other').click();
      cy.get('#staffResponsible').type('Constanza');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#save-withdrawn-button').click();
      cy.wait('@getAccession');

      cy.get('#seeds-withdrawn').contains('99');
      cy.get('#seeds-available').contains('0');
      cy.get('#seeds-available').should('have.css', 'background-color', 'rgb(205, 91, 56)');

      cy.get('#new-withdrawal-button').should('have.css', 'background-color', 'rgba(0, 0, 0, 0.2)');
      cy.get('#new-withdrawal-button').should('have.class', 'Mui-disabled');
    });

    it('should display the records in the right order', () => {
      // by date
      cy.get('#row1-date').contains('2020-01-29');
      cy.get('#row2-date').contains('2020-01-31');
      cy.get('#row4-date').contains('2020-03-28');
      cy.get('#row5-date').contains('Scheduled for');
      cy.get('#row5-date').contains('2030-01-31');

      // by date descending
      cy.get('#table-header-date').click();
      cy.get('#row1-date').contains('Scheduled for');
      cy.get('#row1-date').contains('2030-01-31');
      cy.get('#row2-date').contains('2020-03-28');
      cy.get('#row4-date').contains('2020-01-31');
      cy.get('#row5-date').contains('2020-01-29');

      // by quantity
      cy.get('#table-header-quantity').click();
      cy.get('#row1-quantity').contains('1 Grams');
      cy.get('#row2-quantity').contains('30 Grams');
      cy.get('#row4-quantity').contains('70 Grams');
      cy.get('#row5-quantity').contains('77 Grams');

      // by destination
      cy.get('#table-header-destination').click();
      cy.get('#row1-destination').contains('Panama');
      cy.get('#row2-destination').contains('Paris');
      cy.get('#row4-destination').contains('USA');
      cy.get('#row5-destination').contains('USA');

      // by Purpose, descending
      cy.get('#table-header-purpose').click();
      cy.get('#table-header-purpose').click();
      cy.get('#row1-purpose').contains('Other');
      cy.get('#row2-purpose').contains('Other');
      cy.get('#row3-purpose').contains('Other');
      cy.get('#row5-purpose').contains('Other');

      // by staff, descending
      cy.get('#table-header-staffResponsible').click();
      cy.get('#table-header-staffResponsible').click();
      cy.get('#row1-staffResponsible').contains('Leann');
      cy.get('#row2-staffResponsible').contains('Leann');
      cy.get('#row3-staffResponsible').contains('Constanza');
      cy.get('#row5-staffResponsible').contains('Carlos');
    });
  });

  it('should create a new accession', () => {
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
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');
      cy.visit('/seeds-dashboard');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('9');

      cy.get('#species-current').contains('2');

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('1 accessions');
      cy.get('#update-row-Withdrawn').contains('2 accessions');
    });
  });
});
