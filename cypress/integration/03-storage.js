describe('Storage', () => {
  it('should create the accession and navigate to storage section only when processing and drying is filled', () => {
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
    cy.get('a#menu-storage').should('not.exist');

    cy.get('#menu-processing-drying').click();
    cy.get('#processingMethod').click();
    cy.get('#Count').click();
    cy.get('#quantity').type(10);
    cy.get('#dryingStartDate').type('2021-01-01');
    cy.get('#dryingEndDate').type('2021-01-01');
    cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');
    cy.get('a#menu-storage').should('exist');

    cy.get('#menu-storage').click();
  });

  it('should add storage information', () => {
    cy.get('#storageStartDate').type('2021-02-04');
    cy.get('#storagePackets').type('5');
    cy.get('#storageLocation').click();
    cy.get('#Freezer\\ 1').click();
    cy.get('#storageCondition').should('have.value', 'Freezer');

    cy.get('#storageLocation').click();
    cy.get('#Refrigerator\\ 1').click();
    cy.get('#storageCondition').should('have.value', 'Refrigerator');

    cy.get('#storageNotes').type('A storage note');
    cy.get('#storageStaffResponsible').type('Constanza');

    cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
    cy.get('#saveAccession').click();
    cy.wait('@getAccession');

    cy.get('#storageStartDate').should('have.value', '2021-02-04');
    cy.get('#storagePackets').should('have.value', '5');
    cy.get('#storageLocation + input').should('have.value', 'Refrigerator 1');
    cy.get('#storageCondition').should('have.value', 'Refrigerator');
    cy.get('#storageNotes').should('have.value', 'A storage note');
    cy.get('#storageStaffResponsible').should('have.value', 'Constanza');
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');
      cy.visit('/seeds-dashboard');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('6');

      cy.get('#species-current').contains('2');
    });
  });
});
