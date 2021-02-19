/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Database', () => {
  beforeEach(() => {
    cy.visit('/accessions');
  });

  context('Customize columns', () => {
    it('should display the default columns', () => {
      cy.get('.MuiTableHead-root > .MuiTableRow-root')
        .children()
        .should('have.length', 7);
      cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
        'contain',
        'STATUS'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
        'contain',
        'STATE'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
        'contain',
        'SPECIES'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
        'contain',
        'RECEIVED ON'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
        'contain',
        'COLLECTED ON'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
        'contain',
        'SITE LOCATION'
      );
    });

    it('should handle cancel edit columns action', () => {
      cy.get('#edit-columns').click();
      cy.get('#cancel').click();

      cy.get('.MuiTableHead-root > .MuiTableRow-root')
        .children()
        .should('have.length', 7);
      cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
        'contain',
        'STATUS'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
        'contain',
        'STATE'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
        'contain',
        'SPECIES'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
        'contain',
        'RECEIVED ON'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
        'contain',
        'COLLECTED ON'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
        'contain',
        'SITE LOCATION'
      );
    });

    it('should be able to select the columns', () => {
      cy.get('#edit-columns').click();

      cy.get('#species').click();
      cy.get('#receivedDate').click();
      cy.get('#collectedDate').click();
      cy.get('#primaryCollector').click();
      cy.get('#submit').click();

      cy.get('.MuiTableHead-root > .MuiTableRow-root')
        .children()
        .should('have.length', 5);
      cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
        'contain',
        'STATUS'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
        'contain',
        'STATE'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
        'contain',
        'COLLECTOR'
      );
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
        'contain',
        'SITE LOCATION'
      );
    });

    context('Presets', () => {
      it('General Inventory', () => {
        cy.get('#edit-columns').click();
        cy.get('#General\\ Inventory').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root')
          .children()
          .should('have.length', 19);
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
          'contain',
          'STATUS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
          'contain',
          'STATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
          'contain',
          'SPECIES'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
          'contain',
          'RECEIVED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
          'contain',
          'COLLECTED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
          'contain',
          'COLLECTOR'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should(
          'contain',
          'SITE LOCATION'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should(
          'contain',
          'ENDANGERED'
        );
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)'
        ).should('contain', 'RARE');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)'
        ).should('contain', 'TREES COLLECTED FROM');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)'
        ).should('contain', 'ESTIMATED SEEDS INCOMING');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)'
        ).should('contain', 'LANDOWNER');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(14)'
        ).should('contain', 'STORAGE CONDITION');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(15)'
        ).should('contain', 'NUMBER OF SEEDS WITHDRAWN');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(16)'
        ).should('contain', 'NUMBER OF SEEDS REMAINING');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(17)'
        ).should('contain', 'MOST RECENT GERMINATION TEST DATE');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(18)'
        ).should('contain', 'MOST RECENT % VIABILITY');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(19)'
        ).should('contain', 'TOTAL ESTIMATED % VIABILITY');
      });

      it('Default', () => {
        cy.get('#edit-columns').click();
        cy.get('#General\\ Inventory').click();
        cy.get('#Default').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root')
          .children()
          .should('have.length', 7);
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
          'contain',
          'STATUS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
          'contain',
          'STATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
          'contain',
          'SPECIES'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
          'contain',
          'RECEIVED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
          'contain',
          'COLLECTED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
          'contain',
          'SITE LOCATION'
        );
      });

      it('Seed Storage Status', () => {
        cy.get('#edit-columns').click();
        cy.get('#Seed\\ Storage\\ Status').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root')
          .children()
          .should('have.length', 14);
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
          'contain',
          'STATUS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
          'contain',
          'STATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
          'contain',
          'SPECIES'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
          'contain',
          'RECEIVED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
          'contain',
          'COLLECTED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
          'contain',
          'ESTIMATED SEEDS INCOMING'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should(
          'contain',
          'STORING START DATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should(
          'contain',
          'STORAGE CONDITION'
        );
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)'
        ).should('contain', 'STORAGE LOCATION');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)'
        ).should('contain', 'NUMBER OF STORAGE PACKETS');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)'
        ).should('contain', 'NOTES');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)'
        ).should('contain', 'NUMBER OF SEEDS REMAINING');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(14)'
        ).should('contain', 'MOST RECENT % VIABILITY');
      });

      it('Viability Summary', () => {
        cy.get('#edit-columns').click();
        cy.get('#Viability\\ Summary').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root')
          .children()
          .should('have.length', 18);
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
          'contain',
          'STATUS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
          'contain',
          'STATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
          'contain',
          'SPECIES'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
          'contain',
          'COLLECTED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
          'contain',
          'GERMINATION TEST TYPE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
          'contain',
          'SEED TYPE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should(
          'contain',
          'GERMINATION TREATMENT'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should(
          'contain',
          'NUMBER OF SEEDS FILLED'
        );
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)'
        ).should('contain', 'NOTES');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)'
        ).should('contain', 'NUMBER OF SEEDS SOWN');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)'
        ).should('contain', 'TOTAL OF SEEDS GERMINATED');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)'
        ).should('contain', 'NUMBER OF SEEDS EMPTY');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(14)'
        ).should('contain', 'GERMINATION SUBSTRATE');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(15)'
        ).should('contain', 'TOTAL % OF SEEDS GERMINATED');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(16)'
        ).should('contain', 'NUMBER OF SEEDS COMPROMISED');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(17)'
        ).should('contain', 'MOST RECENT % VIABILITY');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(18)'
        ).should('contain', 'TOTAL ESTIMATED % VIABILITY');
      });

      it('Germination Testing To Do', () => {
        cy.get('#edit-columns').click();
        cy.get('#Germination\\ Testing\\ To\\ Do').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root')
          .children()
          .should('have.length', 11);
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
          'contain',
          'STATUS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
          'contain',
          'STATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
          'contain',
          'SPECIES'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
          'contain',
          'COLLECTED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
          'contain',
          'STORAGE CONDITION'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
          'contain',
          'STORAGE LOCATION'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should(
          'contain',
          'NUMBER OF STORAGE PACKETS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should(
          'contain',
          'NOTES'
        );
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)'
        ).should('contain', 'GERMINATION TEST TYPE');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)'
        ).should('contain', 'GERMINATION START DATE');
      });

      it('Custom columns', () => {
        cy.get('#edit-columns').click();
        cy.get('#Germination\\ Testing\\ To\\ Do').click();

        cy.get('#primaryCollector').click();
        cy.get('#rare').click();

        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root')
          .children()
          .should('have.length', 13);
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION');
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should(
          'contain',
          'STATUS'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should(
          'contain',
          'STATE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should(
          'contain',
          'SPECIES'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should(
          'contain',
          'COLLECTED ON'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should(
          'contain',
          'COLLECTOR'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should(
          'contain',
          'RARE'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should(
          'contain',
          'STORAGE CONDITION'
        );
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should(
          'contain',
          'STORAGE LOCATION'
        );
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)'
        ).should('contain', 'NUMBER OF STORAGE PACKETS');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)'
        ).should('contain', 'NOTES');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)'
        ).should('contain', 'GERMINATION TEST TYPE');
        cy.get(
          '.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)'
        ).should('contain', 'GERMINATION START DATE');
      });
    });
  });

  context('Filters', () => {
    it('Should filter by Active Status', () => {
      cy.get(
        '.MuiContainer-root > :nth-child(2) > :nth-child(1) > .MuiButtonBase-root'
      ).click();
      cy.get('.MuiList-root > :nth-child(1)').click();

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '7 total');
    });

    it('Should clear Status filter', () => {
      cy.get(
        '.MuiContainer-root > :nth-child(2) > :nth-child(1) > .MuiButtonBase-root'
      ).click();
      cy.get('#clear').click();

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '9 total');
    });

    it('Should filter by Processing state', () => {
      cy.get(':nth-child(3) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('.MuiPaper-root #Processing .MuiCheckbox-root')
        .click()
        .type('{esc}');

      cy.wait(3000);
      cy.get('#subtitle').contains('1 total');
    });

    it('Should clear state filter', () => {
      cy.get(':nth-child(3) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#clear').click();

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '9 total');
    });

    it.skip('Should search by specie', () => {
      cy.get(':nth-child(4) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get(
        '#searchFilter > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input'
      ).type('kousa');
      cy.get(
        '#searchFilter > .MuiFormControl-root > .MuiInputBase-root > .MuiInputAdornment-root > .MuiSvgIcon-root'
      ).click();

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '3 total');
    });

    it('Should search by Received on', () => {
      cy.get(':nth-child(5) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#startDate').clear().type('02/03/2021');
      cy.get('#endDate').clear().type('02/04/2021').type('{enter}');

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '1 total');
    });

    it('Should clear all filters', () => {
      cy.get('#clearAll').click();

      cy.wait(3000);
      cy.get('#subtitle').contains('9 total');
    });

    it('Should download report', () => {
      cy.intercept('POST', '/api/v1/seedbank/search/export').as('postReport');
      cy.get('#download-report').click();
      cy.get('#reportName').type('report');
      cy.get('#submit').click();
      cy.wait('@postReport');
    });

    it('Should combine filters', () => {
      // checking state list
      cy.get(':nth-child(3) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#searchstate').children().should('have.length', 5);
      cy.get('#searchstate').type('{esc}');

      // selecting status
      cy.get(
        '.MuiContainer-root > :nth-child(2) > :nth-child(1) > .MuiButtonBase-root'
      ).click();
      cy.get('.MuiList-root > :nth-child(1)').click();

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '7 total');

      // checking state list
      cy.get(':nth-child(3) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#searchstate').children().should('have.length', 4);
      cy.get('#searchstate').type('{esc}');

      // entering site location
      cy.get(':nth-child(7) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get(
        '#searchsiteLocation > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input'
      )
        .type('Sunset')
        .type('{enter}');

      cy.wait(3000);
      cy.get('#subtitle').should('contain', '1 total');

      // checking state list
      cy.get(':nth-child(3) > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#searchstate').children().should('have.length', 1);
      cy.get('#searchstate').type('{esc}');
    });
  });

  context('Sort', () => {
    it('Should be able to sort by status', () => {
      cy.get('.MuiTableRow-root > :nth-child(2) > .MuiButtonBase-root').click();
      cy.wait(3000);

      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').contains(
        'Active'
      );
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)').contains(
        'Processed'
      );

      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(4)').contains(
        'Kousa'
      );
    });

    it('Should be able to sort by state', () => {
      cy.get('.MuiTableRow-root > :nth-child(3) > .MuiButtonBase-root').click();
      cy.wait(3000);

      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').contains(
        'Active'
      );
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)').contains(
        'In Storage'
      );
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(5)').contains(
        '02/03/2021'
      );
    });

    it('Should be able to sort by state, descending', () => {
      cy.get('.MuiTableRow-root > :nth-child(3) > .MuiButtonBase-root').click();
      cy.wait(3000);
      cy.get('.MuiTableRow-root > :nth-child(3) > .MuiButtonBase-root').click();
      cy.wait(3000);

      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').contains(
        'Inactive'
      );
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)').contains(
        'Withdrawn'
      );
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(4)').contains(
        'Dogwood'
      );
    });
  });
});
