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

        cy.get('#table-header').children().should('have.length', 16);
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
        cy.get('#table-header-treesCollectedFrom').contains('NUMBER OF TREES');
        cy.get('#table-header-estimatedSeedsIncoming').contains('ESTIMATED SEEDS INCOMING');
        cy.get('#table-header-landowner').contains('LANDOWNER');
        cy.get('#table-header-storageCondition').contains('STORAGE CONDITION');
        cy.get('#table-header-latestGerminationTestDate').contains('MOST RECENT GERMINATION TEST DATE');
        cy.get('#table-header-latestViabilityPercent').contains('MOST RECENT % VIABILITY');
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

        cy.get('#table-header').children().should('have.length', 13);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-active').contains('ACTIVE/INACTIVE');
        cy.get('#table-header-state').contains('STAGE');
        cy.get('#table-header-species').contains('SPECIES');
        cy.get('#table-header-receivedDate').contains('RECEIVED DATE');
        cy.get('#table-header-collectedDate').contains('COLLECTED DATE');
        cy.get('#table-header-estimatedSeedsIncoming').should('contain', 'ESTIMATED SEEDS INCOMING');
        cy.get('#table-header-storageStartDate').should('contain', 'STORING START DATE');
        cy.get('#table-header-storageCondition').contains('STORAGE CONDITION');
        cy.get('#table-header-storageLocation').contains('STORAGE LOCATION');
        cy.get('#table-header-storagePackets').contains('NUMBER OF STORAGE PACKETS');
        cy.get('#table-header-storageNotes').contains('NOTES');
        cy.get('#table-header-latestViabilityPercent').contains('MOST RECENT % VIABILITY');
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
        cy.get('#table-header-germinationTestType').contains('GERMINATION TEST TYPE');
        cy.get('#table-header-germinationSeedType').contains('SEED TYPE');
        cy.get('#table-header-germinationTreatment').contains('GERMINATION TREATMENT');
        cy.get('#table-header-cutTestSeedsFilled').contains('NUMBER OF SEEDS FILLED');
        cy.get('#table-header-germinationTestNotes').contains('NOTES');
        cy.get('#table-header-germinationSeedsSown').contains('NUMBER OF SEEDS SOWN');
        cy.get('#table-header-germinationSeedsGerminated').contains('TOTAL OF SEEDS GERMINATED');
        cy.get('#table-header-cutTestSeedsEmpty').contains('NUMBER OF SEEDS EMPTY');
        cy.get('#table-header-germinationSubstrate').contains('GERMINATION SUBSTRATE');
        cy.get('#table-header-germinationPercentGerminated').contains('% VIABILITY');
        cy.get('#table-header-cutTestSeedsCompromised').contains('NUMBER OF SEEDS COMPROMISED');
        cy.get('#table-header-latestViabilityPercent').contains('MOST RECENT % VIABILITY');
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
        cy.get('#table-header-storagePackets').contains('NUMBER OF STORAGE PACKETS');
        cy.get('#table-header-storageNotes').contains('NOTES');
        cy.get('#table-header-germinationTestType').contains('GERMINATION TEST TYPE');
        cy.get('#table-header-germinationStartDate').contains('GERMINATION START DATE');
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
      cy.get('#clear').click({ force: true });

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
      cy.get('#subtitle').contains('3 total');
    });

    it('Should clear state filter', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#clear').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-state').should('not.exist');
      cy.get('#subtitle').should('contain', '13 total');
    });

    it('Should search by species', () => {
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
      cy.get('#clear').click({ force: true });

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

      cy.get('#clearAll').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#subtitle').contains('13 total');
    });

    it('Should download report', () => {
      cy.intercept('POST', '/api/v1/seedbank/search/export').as('postReport');

      cy.get('#download-report').click();
      cy.get('#reportName').type('report');

      cy.get('#downloadButton').click();
      cy.wait('@postReport');
    });

    it('Should search by SeedsRemaining - SeedCount', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search-c');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values-c');
      cy.get('#edit-columns').click();
      cy.get('#remainingQuantity').click();
      cy.get('#totalQuantity').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search-c');
      cy.wait('@values-c');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');
      cy.get('#seedCount').click();

      cy.get('#countMinValue').clear().type('0');
      cy.get('#countMaxValue').clear().type('10');
      cy.get('#countMinValue').type('{esc}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#seedCount').should('not.exist');
      cy.get('#subtitle').should('contain', '2 total');
      cy.get('#row1-remainingQuantity').should('contain', '10 Seeds');
      cy.get('#row2-remainingQuantity').should('contain', '0 Seeds');
      cy.get('#filter-remainingQuantity').should('contain', '(1)');
    });

    it('Should search by SeedsRemaining - SeedCount and empty fields', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');

      cy.get('#emptyFields').click();
      cy.get('#countMinValue').type('{esc}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#seedCount').should('not.exist');
      cy.get('#subtitle').should('contain', '9 total');

      cy.get('#row1-remainingQuantity').should('contain', '10 Seeds');
      cy.get('#row2-remainingQuantity').should('contain', '');
      cy.get('#filter-remainingQuantity').should('contain', '(2)');
    });

    it('Should search by SeedsRemaining - SeedWeight', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');

      cy.get('#seedCount').click();
      cy.get('#emptyFields').click();
      cy.get('#seedWeight').click();
      cy.get('#weightMinValue').clear().type('0');
      cy.get('#weightMaxValue').clear().type('0.5');

      cy.get('#processingUnit').click();
      cy.get('#Kilograms').click();

      cy.get('#countMinValue').type('{esc}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#seedCount').should('not.exist');
      cy.get('#subtitle').should('contain', '2 total');

      cy.get('#row1-remainingQuantity').should('contain', '500 Grams');
      cy.get('#row2-remainingQuantity').should('contain', '0 Grams');
      cy.get('#filter-remainingQuantity').should('contain', '(1)');
    });

    it('Should clear all filters', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#clearAll').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#subtitle').contains('13 total');
    });

    it('Should search by QuantityFfSeeds and SeedsRemaining - SeedCount', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');
      cy.get('#seedCount').click();

      cy.get('#countMinValue').clear().type('0');
      cy.get('#countMaxValue').clear().type('1000');
      cy.get('#countMinValue').type('{esc}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#seedCount').should('not.exist');
      cy.get('#subtitle').should('contain', '4 total');
      cy.get('#row1-remainingQuantity').should('contain', '10 Seeds');
      cy.get('#row2-remainingQuantity').should('contain', '825 Seeds');
      cy.get('#filter-remainingQuantity').should('contain', '(1)');

      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-totalQuantity').click();
      cy.get('#seedCount').should('be.visible');
      cy.get('#seedCount').click();

      cy.get('#countMinValue').clear().type('200');
      cy.get('#countMaxValue').clear().type('600');
      cy.get('#emptyFields').click();
      cy.get('#countMinValue').type('{esc}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#seedCount').should('not.exist');
      cy.get('#subtitle').should('contain', '2 total');
      cy.get('#row1-totalQuantity').should('contain', '500 Seeds');
      cy.get('#row2-totalQuantity').should('contain', '300 Seeds');
      cy.get('#filter-remainingQuantity').should('contain', '(1)');
      cy.get('#filter-totalQuantity').should('contain', '(2)');

      cy.get('#filter-totalQuantity').click();
      cy.get('#seedCount').should('be.visible');
      cy.get('#check-seedCount').should('have.checked', 'true');
      cy.get('#countMinValue').should('have.value', '200');
      cy.get('#countMaxValue').should('have.value', '600');
      cy.get('#check-emptyFields').should('have.checked', 'true');
      cy.get('#countMinValue').type('{esc}');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');
      cy.get('#check-seedCount').should('have.checked', 'true');
      cy.get('#countMinValue').should('have.value', '0');
      cy.get('#countMaxValue').should('have.value', '1000');
      cy.get('#check-emptyFields').should('not.have.checked', 'true');
      cy.get('#countMinValue').type('{esc}');
    });

    it('Should clear all filters', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#clearAll').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#subtitle').contains('13 total');
    });

    it('Should combine filters', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      // checking state list
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#filter-list-state').children().should('have.length', 9);
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
      cy.get('#filter-list-state .Mui-disabled .MuiCheckbox-root').should('have.length', 8);
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
      cy.get('#row1-state').contains('Awaiting Check-In');
    });

    it('Should be able to sort by state, descending', () => {
      cy.intercept('POST', '/api/v1/seedbank/search').as('search');
      cy.get('#table-header-state').click();
      cy.wait('@search');

      cy.get('#row1-active').contains('Inactive');
      cy.get('#row1').should('have.css', 'background-color', 'rgb(248, 249, 250)');
      cy.get('#row1-state').contains('Withdrawn');
      cy.get('#row5-species').contains('Dogwood');
    });
  });

  context('State management', () => {
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
        .should('match', /accessions\/[A-Za-z0-9]+\/processing-drying/);
      cy.get('#close').click();

      cy.get('#subtitle').should('contain', '4 total');
      cy.get('#row1-species').contains('Other Dogwood');
      cy.get('#filter-rare').contains('Rare');
    });
  });

  context('Navigation', () => {
    it('should handle the Pending navigation', () => {
      cy.visit('/accessions');

      cy.get('#row10-state').contains('Pending');
      cy.get('#row3')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/seed-collection/);
    });

    it('should handle the Processing navigation', () => {
      cy.visit('/accessions');

      cy.get('#row12-state').contains('Processing');
      cy.get('#row12')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/processing-drying/);
    });

    it('should handle the Dried navigation', () => {
      cy.visit('/accessions');

      cy.get('#row1-state').contains('Dried');
      cy.get('#row1')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/storage/);
    });

    it('should handle the Withdrawn navigation', () => {
      cy.visit('/accessions');

      cy.get('#row8-state').contains('Withdrawn');
      cy.get('#row8')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/withdrawal/);
    });
  });
});
