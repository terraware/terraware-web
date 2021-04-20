/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Database', () => {
  context('Customize columns', () => {
    it('should display the default columns', () => {
      cy.visit('/accessions');
      cy.get('#table-header').children().should('have.length', 7);
      cy.get('#table-header-accessionNumber').contains('ACCESSION');
      cy.get('#table-header-state').contains('STAGE');
      cy.get('#table-header-species').contains('SPECIES');
      cy.get('#table-header-receivedDate').contains('RECEIVED DATE');
      cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
      cy.get('#table-header-siteLocation').contains('SITE LOCATION');
    });

    it('should handle cancel edit columns action', () => {
      cy.get('#edit-columns').click();

      cy.get('#cancel').click();
      cy.get('#editColumnsDialog').should('not.exist');

      cy.get('#table-header').children().should('have.length', 7);
      cy.get('#table-header-accessionNumber').contains('ACCESSION');
      cy.get('#table-header-state').contains('STAGE');
      cy.get('#table-header-species').contains('SPECIES');
      cy.get('#table-header-receivedDate').contains('RECEIVED DATE');
      cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
      cy.get('#table-header-primaryCollector').contains('COLLECTOR');
      cy.get('#table-header-siteLocation').contains('SITE LOCATION');
    });

    it('should be able to select the columns', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#edit-columns').click();

      cy.get('#species').click();
      cy.get('#receivedDate').click();
      cy.get('#collectedDate').click();
      cy.get('#primaryCollector').click();
      cy.get('#active').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search');
      cy.wait('@values');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.get('#table-header').children().should('have.length', 4);
      cy.get('#table-header > :nth-child(1)').contains('ACCESSION');
      cy.get('#table-header > :nth-child(2)').contains('SITE LOCATION');
      cy.get('#table-header > :nth-child(3)').contains('STAGE');
      cy.get('#table-header > :nth-child(4)').contains('ACTIVE/INACTIVE');
    });

    context('Presets', () => {
      it('General Inventory', () => {
        cy.intercept('POST', '/api/v1/seedbank/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');
        cy.visit('/accessions');
        cy.wait('@search');
        cy.wait('@values');

        cy.intercept('POST', '/api/v1/seedbank/search').as('search2');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

        cy.get('#edit-columns').click();

        cy.get('#General\\ Inventory').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search2');
        cy.wait('@values2');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 19);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-active').contains('ACTIVE/INACTIVE');
        cy.get('#table-header-state').contains('STAGE');
        cy.get('#table-header-species').contains('SPECIES');
        cy.get('#table-header-receivedDate').contains('RECEIVED DATE');
        cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
        cy.get('#table-header-primaryCollector').contains('COLLECTOR');
        cy.get('#table-header-siteLocation').contains('SITE LOCATION');
        cy.get('#table-header-endangered').contains('ENDANGERED');
        cy.get('#table-header-rare').contains('RARE');
        cy.get('#table-header-treesCollectedFrom').contains(
          '# OF TREES'
        );
        cy.get('#table-header-estimatedSeedsIncoming').contains(
          'ESTIMATED SEEDS INCOMING'
        );
        cy.get('#table-header-landowner').contains('LANDOWNER');
        cy.get('#table-header-storageCondition').contains('STORAGE CONDITION');
        cy.get('#table-header-withdrawalSeeds').contains(
          'NUMBER OF SEEDS WITHDRAWN'
        );
        cy.get('#table-header-seedsRemaining').contains(
          'NUMBER OF SEEDS REMAINING'
        );
        cy.get('#table-header-latestGerminationTestDate').contains(
          'MOST RECENT GERMINATION TEST DATE'
        );
        cy.get('#table-header-latestViabilityPercent').contains(
          'MOST RECENT % VIABILITY'
        );
      });

      it('Default', () => {
        cy.intercept('POST', '/api/v1/seedbank/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');

        cy.get('#edit-columns').click();

        cy.get('#General\\ Inventory').click();
        cy.get('#Default').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 7);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-state').contains('STAGE');
        cy.get('#table-header-species').contains('SPECIES');
        cy.get('#table-header-receivedDate').contains('RECEIVED DATE');
        cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
        cy.get('#table-header-primaryCollector').contains('COLLECTOR');
        cy.get('#table-header-siteLocation').contains('SITE LOCATION');
      });

      it('Seed Storage Status', () => {
        cy.intercept('POST', '/api/v1/seedbank/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');

        cy.get('#edit-columns').click();

        cy.get('#Seed\\ Storage\\ Status').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 14);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-active').contains('ACTIVE/INACTIVE');
        cy.get('#table-header-state').contains('STAGE');
        cy.get('#table-header-species').contains('SPECIES');
        cy.get('#table-header-receivedDate').contains('RECEIVED DATE');
        cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
        cy.get('#table-header-estimatedSeedsIncoming').should(
          'contain',
          'ESTIMATED SEEDS INCOMING'
        );
        cy.get('#table-header-storageStartDate').should(
          'contain',
          'STORING START DATE'
        );
        cy.get('#table-header-storageCondition').contains('STORAGE CONDITION');
        cy.get('#table-header-storageLocation').contains('STORAGE LOCATION');
        cy.get('#table-header-storagePackets').contains(
          'NUMBER OF STORAGE PACKETS'
        );
        cy.get('#table-header-storageNotes').contains('NOTES');
        cy.get('#table-header-seedsRemaining').contains(
          'NUMBER OF SEEDS REMAINING'
        );
        cy.get('#table-header-latestViabilityPercent').contains(
          'MOST RECENT % VIABILITY'
        );
      });

      it('Viability Summary', () => {
        cy.intercept('POST', '/api/v1/seedbank/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');

        cy.get('#edit-columns').click();

        cy.get('#Viability\\ Summary').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 17);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-active').contains('ACTIVE/INACTIVE');
        cy.get('#table-header-state').contains('STAGE');
        cy.get('#table-header-species').contains('SPECIES');
        cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
        cy.get('#table-header-germinationTestType').contains(
          'GERMINATION TEST TYPE'
        );
        cy.get('#table-header-germinationSeedType').contains('SEED TYPE');
        cy.get('#table-header-germinationTreatment').contains(
          'GERMINATION TREATMENT'
        );
        cy.get('#table-header-cutTestSeedsFilled').contains(
          'NUMBER OF SEEDS FILLED'
        );
        cy.get('#table-header-germinationTestNotes').contains('NOTES');
        cy.get('#table-header-germinationSeedsSown').contains(
          'NUMBER OF SEEDS SOWN'
        );
        cy.get('#table-header-germinationSeedsGerminated').contains(
          'TOTAL OF SEEDS GERMINATED'
        );
        cy.get('#table-header-cutTestSeedsEmpty').contains(
          'NUMBER OF SEEDS EMPTY'
        );
        cy.get('#table-header-germinationSubstrate').contains(
          'GERMINATION SUBSTRATE'
        );
        cy.get('#table-header-germinationPercentGerminated').contains(
          '% VIABILITY'
        );
        cy.get('#table-header-cutTestSeedsCompromised').contains(
          'NUMBER OF SEEDS COMPROMISED'
        );
        cy.get('#table-header-latestViabilityPercent').contains(
          'MOST RECENT % VIABILITY'
        );
      });

      it('Germination Testing To Do', () => {
        cy.intercept('POST', '/api/v1/seedbank/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');

        cy.get('#edit-columns').click();

        cy.get('#Germination\\ Testing\\ To\\ Do').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 11);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-active').contains('ACTIVE/INACTIVE');
        cy.get('#table-header-state').contains('STAGE');
        cy.get('#table-header-species').contains('SPECIES');
        cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
        cy.get('#table-header-storageCondition').contains('STORAGE CONDITION');
        cy.get('#table-header-storageLocation').contains('STORAGE LOCATION');
        cy.get('#table-header-storagePackets').contains(
          'NUMBER OF STORAGE PACKETS'
        );
        cy.get('#table-header-storageNotes').contains('NOTES');
        cy.get('#table-header-germinationTestType').contains(
          'GERMINATION TEST TYPE'
        );
        cy.get('#table-header-germinationStartDate').contains(
          'GERMINATION START DATE'
        );
      });

      it('Custom columns', () => {
        cy.intercept('POST', '/api/v1/seedbank/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');

        cy.get('#edit-columns').click();

        cy.get('#Germination\\ Testing\\ To\\ Do').click();
        cy.get('#primaryCollector').click();
        cy.get('#rare').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 13);
        cy.get('#table-header > :nth-child(1)').contains('ACCESSION');
        cy.get('#table-header > :nth-child(2)').contains('SPECIES');
        cy.get('#table-header > :nth-child(3)').contains('ACTIVE/INACTIVE');
        cy.get('#table-header > :nth-child(4)').contains('STAGE');
        cy.get('#table-header > :nth-child(5)').contains('COLLECTED DATE');
        cy.get('#table-header > :nth-child(6)').contains('NUMBER OF STORAGE PACKETS');
        cy.get('#table-header > :nth-child(7)').contains('STORAGE CONDITION');
        cy.get('#table-header > :nth-child(8)').contains('STORAGE LOCATION');
        cy.get('#table-header > :nth-child(9)').contains('NOTES');
        cy.get('#table-header > :nth-child(10)').contains('GERMINATION TEST TYPE');
        cy.get('#table-header > :nth-child(11)').contains('GERMINATION START DATE');
        cy.get('#table-header > :nth-child(12)').contains('COLLECTOR');
        cy.get('#table-header > :nth-child(13)').contains('RARE');
      });
    });
  });

  context('Filters', () => {
    it('Should filter by Active Status', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.wait('@values');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search-c');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values-c');
      cy.get('#edit-columns').click();
      cy.get('#active').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search-c');
      cy.wait('@values-c');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search2');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

      cy.get('#filter-active').click();
      cy.get('#filter-list-active').should('be.visible');
      cy.get('#Active').click();

      cy.wait('@search2');
      cy.wait('@values2');

      cy.get('#filter-list-active').should('not.exist');
      cy.get('#subtitle').should('contain', '11 total');
    });

    it('Should clear Status filter', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-active').click();
      cy.get('#filter-list-active').should('be.visible');
      cy.get('#clear').click();

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-active').should('not.exist');
      cy.get('#subtitle').should('contain', '13 total');
    });

    it('Should filter by Processing state', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#check-Processing').click();
      cy.get('#filter-list-state').type('{esc}');
      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-state').should('not.exist');
      cy.get('#subtitle').contains('1 total');
    });

    it('Should clear state filter', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#clear').click();

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-state').should('not.exist');
      cy.get('#subtitle').should('contain', '13 total');
    });

    it('Should search by specie', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-species').click();
      cy.get('#species').should('be.visible');
      cy.get('#species').type('kousa').type('{enter}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#species').should('not.exist');
      cy.get('#subtitle').should('contain', '3 total');
    });

    it('Should clear state filter', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-species').click();
      cy.get('#species').should('be.visible');
      cy.get('#clear').click();

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#species').should('not.exist');
      cy.get('#subtitle').should('contain', '13 total');
    });

    it('Should search by Received on', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-receivedDate').click();
      cy.get('#startDate').should('be.visible');
      cy.get('#startDate').clear().type('02/03/2021');
      cy.get('#endDate').clear().type('02/04/2021').type('{enter}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#startDate').should('not.exist');
      cy.get('#subtitle').should('contain', '1 total');
    });

    it('Should clear all filters', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#clearAll').click();

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#subtitle').contains('13 total');
    });

    it("Should filter by seeds counted", () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.get('#edit-columns').click();
      cy.get('#seedsCounted').click();
      cy.get('#saveColumnsButton').click();
      cy.get('#filter-seedsCounted').click();
      cy.get('#minValue').type('200');
      cy.get('#maxValue').type('400').type('{enter}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#maxValue').should('not.exist');
      cy.get('#subtitle').should('contain', '1 total');      
    });

    it('Should clear seeds counted filter', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-seedsCounted').click();
      cy.get('#minValue').should('be.visible');
      cy.get('#clear').click();

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#minValue').should('not.exist');
      cy.get('#subtitle').should('contain', '13 total');
    });

    it('Should download report', () => {
      cy.intercept('POST', '/api/v1/seedbank/search/export').as('postReport');

      cy.get('#download-report').click();
      cy.get('#reportName').type('report');

      cy.get('#downloadButton').click();
      cy.wait('@postReport');
    });

    it('Should combine filters', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      // checking state list
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#filter-list-state').children().should('have.length', 7);
      cy.get('#filter-list-state .Mui-disabled .MuiCheckbox-root').should('have.length', 2);
      cy.get('#filter-list-state').type('{esc}');
      cy.get('#filter-list-state').should('not.exist');

      cy.get('#filter-active').click();
      cy.get('#filter-list-active').should('be.visible');
      cy.get('#Active').click();

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-active').should('not.exist');
      cy.get('#subtitle').should('contain', '11 total');

      // re-checking state list
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#filter-list-state .Mui-disabled .MuiCheckbox-root').should('have.length', 3);
      cy.get('#filter-list-state').type('{esc}');
      cy.get('#filter-list-state').should('not.exist');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search2');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

      cy.get('#filter-siteLocation').click();
      cy.get('#siteLocation').should('be.visible');
      cy.get('#siteLocation').type('Sunset').type('{enter}');

      cy.wait('@search2');
      cy.wait('@values2');

      cy.get('#siteLocation').should('not.exist');
      cy.get('#subtitle').should('contain', '1 total');

      // re-checking state list
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#filter-list-state .Mui-disabled .MuiCheckbox-root').should('have.length', 6);
      cy.get('#filter-list-state').type('{esc}');
      cy.get('#filter-list-state').should('not.exist');
    });
  });

  context('Sort', () => {
    it('Should be able to sort by species', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.wait('@values');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search-c');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values-c');
      cy.get('#edit-columns').click();
      cy.get('#active').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search-c');
      cy.wait('@values-c');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search2');
      cy.get('#table-header-species').click();
      cy.wait('@search2');

      cy.get('#row13-species').contains('Other Dogwood');
      cy.get('#row10-species').contains('Kousa');
    });

    it('Should be able to sort by state', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.get('#table-header-state').click();
      cy.wait('@search');

      cy.get('#row1-active').contains('Active');
      cy.get('#row1-state').contains('Drying');
    });

    it('Should be able to sort by state, descending', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.get('#table-header-state').click();
      cy.wait('@search');

      cy.get('#row1-active').contains('Inactive');
      cy.get('#row1').should('have.css', 'background-color', 'rgb(248, 249, 250)');
      cy.get('#row1-state').contains('Withdrawn');
      cy.get('#row3-species').contains('Dogwood');
    });
  });

  context('Stage management', () => {
    it('Should remember filters, sorting and selected columns when switching pages', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.wait('@values');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search2');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

      cy.get('#edit-columns').click();
      cy.get('#rare').click();
      cy.get('#saveColumnsButton').click();
      cy.get('#editColumnsDialog').should('not.exist');

      cy.wait('@search2');
      cy.wait('@values2');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search3');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values3');

      cy.get('#filter-species').click();
      cy.get('#species').should('be.visible');
      cy.get('#species').type('dogwood').type('{enter}');

      cy.wait('@search3');
      cy.wait('@values3');

      cy.get('#species').should('not.exist');
      cy.get('#subtitle').should('contain', '4 total');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search4');
      cy.get('#table-header-species').click();
      cy.wait('@search4');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search5');
      cy.get('#table-header-species').click();
      cy.wait('@search5');

      cy.get('#row1-species').contains('Other Dogwood');

      cy.get('#filter-rare').should('exist');

      // Should remember the filters

      cy.get('#row1')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/seed-collection/);
      cy.get('#close').click();

      cy.get('#subtitle').should('contain', '4 total');
      cy.get('#row1-species').contains('Other Dogwood');
      cy.get('#filter-rare').contains('Rare');
    });
  });
});
