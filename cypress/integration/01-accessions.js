/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Accessions', () => {
  context('Summary Start Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('3');
      cy.get('#sessions-change').contains('0% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('2');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('1');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('0 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });

  context('Navigation', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should navigate in and out of the new accession page', () => {
      cy.get('#newAccession')
        .click()
        .url()
        .should('contain', '/accessions/new');
      cy.get('#closenewAccession').click().url().should('contain', '/');

      cy.get('#newAccession')
        .click()
        .url()
        .should('contain', '/accessions/new');
      cy.get('#cancelButton').click().url().should('contain', '/');
    });
  });

  context('Accessions', () => {
    it('should create the accession', () => {
      cy.visit('/');
      cy.get('#newAccession')
        .click()
        .url()
        .should('contain', '/accessions/new');

      cy.get('#species').type('Kousa Dogwoord');
      cy.get('#family').type('Cornaceae');
      cy.get('#numberOfTrees').type('3');
      cy.get('#founderId').type('234908098');
      cy.get('#check-endangered').click();
      cy.get('#check-rare').click();

      cy.get('#fieldNotes').type('Some notes');
      cy.get('#collectedDate').type('02/01/2021');
      cy.get('#receivedDate').type('02/03/2021');
      cy.get('#primaryCollector').type('Carlos');
      cy.get('#secondaryCollectors0').type('Constanza');
      cy.get('#addCollectorButton').click();
      cy.get('#secondaryCollectors1').type('Leann');
      cy.get('#siteLocation').type('Sunset Overdrive');
      cy.get('#landowner').type('Yacin');
      cy.get('#environmentalNotes').type('Cold day');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');
      cy.get('#snackbar').should('not.exist');
      cy.url().should('match', /accessions\/[A-Za-z0-9]+\/seed-collection/);

      cy.get('#header-status').contains('Active');
      cy.get('#header-species').contains('Kousa Dogwoord');
      cy.get('#header-date').contains('02/03/2021');
      cy.get('#header-state').contains('Pending');

      cy.get('#species').should('have.value', 'Kousa Dogwoord');
      cy.get('#family').should('have.value', 'Cornaceae');
      cy.get('#numberOfTrees').should('have.value', '3');
      cy.get('#founderId').should('have.value', '234908098');
      cy.get('#check-endangered').should('have.checked', 'true');
      cy.get('#check-rare').should('have.checked', 'true');
      cy.get('#fieldNotes').should('have.value', 'Some notes');
      cy.get('#collectedDate').should('have.value', '02 / 01 / 2021');
      cy.get('#receivedDate').should('have.value', '02 / 03 / 2021');
      cy.get('#primaryCollector').should('have.value', 'Carlos');
      cy.get('#secondaryCollectors0').should('have.value', 'Constanza');
      cy.get('#secondaryCollectors1').should('have.value', 'Leann');
      cy.get('#siteLocation').should('have.value', 'Sunset Overdrive');
      cy.get('#landowner').should('have.value', 'Yacin');
      cy.get('#environmentalNotes').should('have.value', 'Cold day');
    });

    it('should update the accession', () => {
      cy.get('#delete-secondaryCollectors1').click();
      cy.get('#primaryCollector').clear().type('Leann');
      cy.get('#fieldNotes').clear().type('Other notes');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#fieldNotes').contains('Other notes');
      cy.get('#secondaryCollectors1').should('not.exist');
      cy.get('#primaryCollector').should('have.value', 'Leann');
    });

    it('should add processing and drying information', () => {
      cy.get('#menu-processing-drying')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/processing-drying/);

      cy.get('#processingStartDate').type('01/01/2021');
      cy.get('#processingMethod').click();
      cy.get('#Count').click();
      cy.get('#seedsCounted').type(300);
      cy.get('#check-Nursery').click();
      cy.get('#dryingStartDate').type('01/01/2021');
      cy.get('#dryingEndDate').type('01/01/2021');
      cy.get('#dryingMoveDate').type('01/01/2021');
      cy.get('#processingNotes').type('A processing note');
      cy.get('#processingStaffResponsible').type('Constanza');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#processingStartDate').should('have.value', '01 / 01 / 2021');
      cy.get('#processingMethod + input').should('have.value', 'Count');
      cy.get('#seedsCounted').should('have.value', '300');
      cy.get('#check-Nursery').should('have.checked', 'true');
      cy.get('#dryingStartDate').should('have.value', '01 / 01 / 2021');
      cy.get('#dryingEndDate').should('have.value', '01 / 01 / 2021');
      cy.get('#dryingMoveDate').should('have.value', '01 / 01 / 2021');
      cy.get('#processingNotes').should('have.value', 'A processing note');
      cy.get('#processingStaffResponsible').should('have.value', 'Constanza');
    });

    it('should clear textfield if changing dropdown', () => {
      cy.get('#processingMethod').click();
      cy.get('#Weight').click();

      cy.get('#subsetWeightGrams').type(500);
      cy.get('#subsetCount').type(500);
      cy.get('#totalWeightGrams').type(500);
      cy.get('#estimatedSeedCount').should('have.value', '500');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#subsetWeightGrams').should('have.value', '500');
      cy.get('#estimatedSeedCount').should('have.value', '500');

      cy.get('#processingMethod').click();
      cy.get('#Count').click();
      cy.get('#seedsCounted').should('have.value', '');

      cy.get('#seedsCounted').type(400);

      cy.get('#processingMethod').click();
      cy.get('#Weight').click();
      cy.get('#subsetWeightGrams').should('have.value', '');

      cy.get('#processingMethod').click();
      cy.get('#Count').click();
      cy.get('#seedsCounted').should('have.value', '');
    });

    it('should add storage information', () => {
      cy.get('#menu-storage')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/storage/);

      cy.get('#storageStartDate').type('02/04/2021');
      cy.get('#storagePackets').type('5');
      cy.get('#storageLocation').click();
      cy.get('#Freezer\\ 1').click();
      cy.get('#storageCondition').should('have.value', 'Freezer');

      cy.get('#storageLocation').click();
      cy.get('#Refrigerator\\ 2').click();
      cy.get('#storageCondition').should('have.value', 'Refrigerator');

      cy.get('#storageNotes').type('A storage note');
      cy.get('#storageStaffResponsible').type('Constanza');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');

      cy.get('#storageStartDate').should('have.value', '02 / 04 / 2021');
      cy.get('#storagePackets').should('have.value', '5');
      cy.get('#storageLocation + input').should('have.value', 'Refrigerator 2');
      cy.get('#storageCondition').should('have.value', 'Refrigerator');
      cy.get('#storageNotes').should('have.value', 'A storage note');
      cy.get('#storageStaffResponsible').should('have.value', 'Constanza');
    });
  });

  context('Mobile dropoff', () => {
    it('should show the mobile imported info', () => {
      cy.visit('/accessions/AAF4D49R3E/seed-collection');

      cy.get('#bag0').contains('ABCD001237');
      cy.get('#bag1').contains('ABCD001238');
      cy.get('#location0').contains('9.03, -79.53');

      cy.get('#photo-0').contains('accession1.jpg');
      cy.get('#photo-0')
        .should(
          'have.attr',
          'href',
          'http://localhost:8080/api/v1/seedbank/accession/AAF4D49R3E/photo/accession1.jpg'
        )
        .should('have.attr', 'target', '_blank');

      cy.get('#photo-1').contains('accession2.jpg');
      cy.get('#photo-1')
        .should(
          'have.attr',
          'href',
          'http://localhost:8080/api/v1/seedbank/accession/AAF4D49R3E/photo/accession2.jpg'
        )
        .should('have.attr', 'target', '_blank');

      cy.request(
        'http://localhost:8080/api/v1/seedbank/accession/AAF4D49R3E/photo/accession1.jpg'
      )
        .its('status')
        .should('eq', 200);
      cy.request(
        'http://localhost:8080/api/v1/seedbank/accession/AAF4D49R3E/photo/accession2.jpg'
      )
        .its('status')
        .should('eq', 200);
    });
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary').as('summary');
      cy.visit('/');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('4');
      cy.get('#sessions-change').contains('33% since last week');
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
