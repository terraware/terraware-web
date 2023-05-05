describe('Database', () => {
  it('visits accessions before running tests to clear network problems', () => {
    cy.on('uncaught:exception', () => {
      return false;
    });
    cy.visit('/accessions');
    cy.wait(5000);
  });
  context('Customize columns', () => {
    it('should display the default columns', () => {
      cy.visit('/accessions');
      cy.get('#table-header').children().should('have.length', 8);
      cy.get('#table-header-accessionNumber').contains('ACCESSION');
      cy.get('#table-header-speciesName').contains('SPECIES');
      cy.get('#table-header-state').contains('STATUS');
      cy.get('#table-header-collectionSiteName').contains('COLLECTING SITE');
      cy.get('#table-header-collectedDate').contains('COLLECTION DATE');
      cy.get('#table-header-ageMonths').contains('AGE (MONTH)');
      cy.get('#table-header-estimatedWeightGrams').contains('WEIGHT (G)');
      cy.get('#table-header-estimatedCount').contains('COUNT');
    });

    it('should handle cancel edit columns action', () => {
      cy.visit('/accessions');
      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();

      cy.get('#cancelEditColumns').click();
      cy.get('#editColumnsDialog').should('not.exist');

      cy.get('#table-header').children().should('have.length', 8);
      cy.get('#table-header-accessionNumber').contains('ACCESSION');
      cy.get('#table-header-speciesName').contains('SPECIES');
      cy.get('#table-header-state').contains('STATUS');
      cy.get('#table-header-collectionSiteName').contains('COLLECTING SITE');
      cy.get('#table-header-collectedDate').contains('COLLECTION DATE');
      cy.get('#table-header-ageMonths').contains('AGE (MONTH)');
      cy.get('#table-header-estimatedWeightGrams').contains('WEIGHT (G)');
      cy.get('#table-header-estimatedCount').contains('COUNT');
    });

    it('should be able to select the columns', () => {
      cy.visit('/accessions');
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();

      cy.get('#speciesName').click();
      cy.get('#collectedDate').click();
      cy.get('#facility_name').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search');
      cy.wait('@values');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.get('#table-header').children().should('have.length', 7);
      cy.get('#table-header > :nth-child(1)').contains('ACCESSION');
      cy.get('#table-header > :nth-child(2)').contains('STATUS');
      cy.get('#table-header > :nth-child(7)').contains('SEED BANKS');
      cy.get('#table-header > :nth-child(3)').contains('COLLECTING SITE');
      cy.get('#table-header > :nth-child(4)').contains('AGE (MONTH');
      cy.get('#table-header > :nth-child(5)').contains('WEIGHT (G)');
      cy.get('#table-header > :nth-child(6)').contains('COUNT');
    });

    it('should select ALL the columns', () => {
      cy.visit('/accessions');
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();

      cy.get('.MuiCheckbox-root').each((checkbox) => {
        if (!checkbox.hasClass('Mui-checked')) {
          checkbox.click();
        }
      });

      cy.get('#saveColumnsButton').click();
      cy.wait('@search');
      cy.wait('@values');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.get('#table-header').children().should('have.length', 26);
      cy.get('table tr').should('have.length', 4);
    });

    context('Presets', () => {
      beforeEach(() => {
        cy.intercept('POST', '/api/v1/search').as('search');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values');
        cy.visit('/accessions');
        cy.wait('@search');
        cy.wait('@values');
      });

      it('General Inventory', () => {
        cy.intercept('POST', '/api/v1/search').as('search2');
        cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

        cy.get('#more-options').click();
        cy.get('.MuiList-root > :nth-child(3)').click();

        cy.get('#General\\ Inventory').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search2');
        cy.wait('@values2');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 6);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-state').contains('STATUS');
        cy.get('#table-header-speciesName').contains('SPECIES');
        cy.get('#table-header-collectedDate').contains('COLLECTION DATE');
        cy.get('#table-header-collectionSiteName').contains('COLLECTING SITE');
        cy.get('#table-header-collectionSiteLandowner').contains('LANDOWNER');
      });

      it('Default', () => {
        cy.get('#more-options').click();
        cy.get('.MuiList-root > :nth-child(3)').click();

        cy.get('#Default').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 8);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-state').contains('STATUS');
        cy.get('#table-header-speciesName').contains('SPECIES');
        cy.get('#table-header-collectedDate').contains('COLLECTION DATE');
        cy.get('#table-header-collectionSiteName').contains('COLLECTING SITE');
        cy.get('#table-header-ageMonths').contains('AGE (MONTH');
        cy.get('#table-header-estimatedWeightGrams').contains('WEIGHT (G)');
        cy.get('#table-header-estimatedCount').contains('COUNT');
      });

      it('Seed Storage Status', () => {
        cy.get('#more-options').click();
        cy.get('.MuiList-root > :nth-child(3)').click();

        cy.get('#Seed\\ Storage\\ Status').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 6);
        cy.get('#table-header-accessionNumber').contains('ACCESSION');
        cy.get('#table-header-speciesName').contains('SPECIES');
        cy.get('#table-header-state').contains('STATUS');
        cy.get('#table-header-collectedDate').contains('COLLECTION DATE');
        cy.get('#table-header-facility_name').contains('SEED BANKS');
        cy.get('#table-header-storageLocation_name').contains('SUB-LOCATION');
      });

      it('Custom columns', () => {
        cy.get('#more-options').click();
        cy.get('.MuiList-root > :nth-child(3)').click();

        cy.get('#Seed\\ Storage\\ Status').click();
        cy.get('#species_commonName').click();
        cy.get('#saveColumnsButton').click();
        cy.wait('@search');
        cy.wait('@values');
        cy.get('#editColumnsDialog').should('not.exist');

        cy.get('#table-header').children().should('have.length', 7);
        cy.get('#table-header > :nth-child(1)').contains('ACCESSION');
        cy.get('#table-header > :nth-child(2)').contains('SPECIES');
        cy.get('#table-header > :nth-child(3)').contains('STATUS');
        cy.get('#table-header > :nth-child(4)').contains('COLLECTION DATE');
        cy.get('#table-header > :nth-child(5)').contains('SEED BANKS');
        cy.get('#table-header > :nth-child(6)').contains('SUB-LOCATION');
        cy.get('#table-header > :nth-child(7)').contains('COMMON NAME');
      });
    });
  });

  context.skip('Filters', () => {
    it('Should filter by Active Status', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.wait('@values');

      cy.intercept('POST', '/api/v1/search').as('search-c');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values-c');
      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();
      cy.get('#active').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search-c');
      cy.wait('@values-c');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.intercept('POST', '/api/v1/search').as('search2');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

      cy.get('#filter-active').click();
      cy.get('#filter-list-active').should('be.visible');
      cy.get('#Active').click();

      cy.wait('@search2');
      cy.wait('@values2');

      cy.get('#filter-list-active').should('not.exist');
      cy.get('#subtitle').should('contain', '9 total');
    });

    it('Should clear Status filter', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-active').click();
      cy.get('#filter-list-active').should('be.visible');
      cy.get('#clear').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-active').should('not.exist');
      cy.get('#subtitle').should('contain', '11 total');
    });

    it('Should filter by Processing state', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
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
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#clear').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#filter-list-state').should('not.exist');
      cy.get('#subtitle').should('contain', '11 total');
    });

    it('Should search by species', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-speciesName').click();
      cy.get('#speciesName').should('be.visible');
      cy.get('#speciesName').type('kousa').type('{enter}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#speciesName').should('not.exist');
      cy.get('#subtitle').should('contain', '3 total');
    });

    it('Should clear state filter', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-speciesName').click();
      cy.get('#speciesName').should('be.visible');
      cy.get('#clear').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#speciesName').should('not.exist');
      cy.get('#subtitle').should('contain', '11 total');
    });

    it('Should download report', () => {
      cy.intercept('POST', '/api/v1/search').as('postReport');

      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(2)').click();
      cy.get('#reportName').type('report');

      cy.get('#downloadButton').click();
      cy.wait('@postReport');
    });

    it('Should search by SeedsRemaining - SeedCount', () => {
      cy.intercept('POST', '/api/v1/search').as('search-c');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values-c');
      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();
      cy.get('#remainingQuantity').click();
      cy.get('#totalQuantity').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search-c');
      cy.wait('@values-c');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');
      cy.get('#seedCount').click();

      cy.get('#countMinValue').should('be.visible');
      cy.get('#countMaxValue').should('be.visible');
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
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#filter-remainingQuantity').click();
      cy.get('#seedCount').should('be.visible');

      cy.get('#emptyFields').click();
      cy.get('#countMinValue').type('{esc}');

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#seedCount').should('not.exist');
      cy.get('#subtitle').should('contain', '7 total');

      cy.get('#row1-remainingQuantity').should('contain', '10 Seeds');
      cy.get('#row2-remainingQuantity').should('contain', '');
      cy.get('#filter-remainingQuantity').should('contain', '(2)');
    });

    it.skip('Should search by SeedsRemaining - SeedWeight', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
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
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#clearAll').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#subtitle').contains('11 total');
    });

    it('Should search by QuantityFfSeeds and SeedsRemaining - SeedCount', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
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
      cy.get('#row2-remainingQuantity').should('contain', '265 Seeds');
      cy.get('#filter-remainingQuantity').should('contain', '(1)');

      cy.intercept('POST', '/api/v1/search').as('search');
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
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');

      cy.get('#clearAll').click({ force: true });

      cy.wait('@search');
      cy.wait('@values');

      cy.get('#subtitle').contains('11 total');
    });

    it('Should combine filters', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
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
      cy.get('#subtitle').should('contain', '9 total');

      // re-checking state list
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#filter-list-state .Mui-disabled .MuiCheckbox-root').should('have.length', 3);
      cy.get('#filter-list-state').type('{esc}');
      cy.get('#filter-list-state').should('not.exist');

      cy.intercept('POST', '/api/v1/search').as('search2');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

      cy.get('#filter-collectionSiteName').click();
      cy.get('#collectionSiteName').should('be.visible');
      cy.get('#collectionSiteName').type('Sunset').type('{enter}');

      cy.wait('@search2');
      cy.wait('@values2');

      cy.get('#collectionSiteName').should('not.exist');
      cy.get('#subtitle').should('contain', '1 total');

      // re-checking state list
      cy.get('#filter-state').click();
      cy.get('#filter-list-state').should('be.visible');
      cy.get('#filter-list-state .Mui-disabled .MuiCheckbox-root').should('have.length', 8);
      cy.get('#filter-list-state').type('{esc}');
      cy.get('#filter-list-state').should('not.exist');
    });
  });

  context.skip('Sort', () => {
    it('Should be able to sort by species', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.wait('@values');

      cy.intercept('POST', '/api/v1/search').as('search-c');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values-c');
      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();
      cy.get('#active').click();
      cy.get('#saveColumnsButton').click();
      cy.wait('@search-c');
      cy.wait('@values-c');
      cy.get('#editColumnsDialog').should('not.exist');

      cy.intercept('POST', '/api/v1/search').as('search2');
      cy.get('.scrollable-content').scrollTo('top');
      cy.get('#table-header-speciesName').click({ scrollBehavior: false });
      cy.wait('@search2');

      cy.get('#row11-speciesName').contains('Other Dogwood');
      cy.get('#row8-speciesName').contains('Kousa');
    });

    it('Should be able to sort by state', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.get('.scrollable-content').scrollTo('top');
      cy.get('#table-header-state').click({ scrollBehavior: false });
      cy.wait('@search');

      cy.get('#row1-active').contains('Active');
      cy.get('#row1-state').contains('Awaiting Check-In');
    });

    it('Should be able to sort by state, descending', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.get('.scrollable-content').scrollTo('top');
      cy.get('#table-header-state').click({ scrollBehavior: false });
      cy.wait('@search');

      cy.get('#row1-active').contains('Inactive');
      cy.get('#row1-state').contains('Withdrawn');
      cy.get('#row5-speciesName').contains('Dogwood');
    });
  });

  context.skip('State management', () => {
    it('Should remember filters, sorting and selected columns when switching pages', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.wait('@values');

      cy.intercept('POST', '/api/v1/search').as('search2');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values2');

      cy.get('#more-options').click();
      cy.get('.MuiList-root > :nth-child(3)').click();
      cy.get('#species_rare').click();
      cy.get('#saveColumnsButton').click();
      cy.get('#editColumnsDialog').should('not.exist');

      cy.wait('@search2');
      cy.wait('@values2');

      cy.intercept('POST', '/api/v1/search').as('search3');
      cy.intercept('POST', '/api/v1/seedbank/values').as('values3');

      cy.get('#filter-speciesName').click();
      cy.get('#speciesName').should('be.visible');
      cy.get('#speciesName').type('dogwood').type('{enter}');

      cy.wait('@search3');
      cy.wait('@values3');

      cy.get('#speciesName').should('not.exist');
      cy.get('#subtitle').should('contain', '4 total');

      cy.intercept('POST', '/api/v1/search').as('search4');
      cy.get('#table-header-speciesName').click();
      cy.wait('@search4');

      cy.intercept('POST', '/api/v1/search').as('search5');
      cy.get('#table-header-speciesName').click();
      cy.wait('@search5');

      cy.get('#row1-speciesName').contains('Other Dogwood');

      cy.get('#filter-species_rare').should('exist');

      // Should remember the filters

      cy.get('#row1')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/processing-drying/);
      cy.get('#close').click();

      cy.get('#subtitle').should('contain', '4 total');
      cy.get('#row1-speciesName').contains('Other Dogwood');
      cy.get('#filter-species_rare').contains('Rare');
    });
  });

  context.skip('Navigation', () => {
    it('should handle the Pending navigation', () => {
      cy.visit('/accessions');

      cy.get('#row8-state').contains('Pending');
      cy.get('#row8')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/seed-collection/);
    });

    it('should handle the Processing navigation', () => {
      cy.visit('/accessions');

      cy.get('#row10-state').contains('Processing');
      cy.get('#row10')
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

      cy.get('#row6-state').contains('Withdrawn');
      cy.get('#row6')
        .click()
        .url()
        .should('match', /accessions\/[A-Za-z0-9]+\/withdrawal/);
    });
  });
});
