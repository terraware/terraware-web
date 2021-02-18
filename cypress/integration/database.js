/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Database", () => {

  beforeEach(() => {
    cy.visit("/accessions");
  });

  context("Customize columns", () => {
    it("should display the default columns", () => {
      cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 7)
      cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'RECEIVED ON')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'COLLECTED ON')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'SITE LOCATION')
    });

    it("should handle cancel edit columns action", () => {
      cy.get('#edit-columns').click()
      cy.get('#cancel').click();

      cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 7)
      cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'RECEIVED ON')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'COLLECTED ON')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'SITE LOCATION')
    });

    it("should be able to select the columns", () => {
      cy.get('#edit-columns').click()

      cy.get('#species').click()
      cy.get('#receivedDate').click()
      cy.get('#collectedDate').click()
      cy.get('#primaryCollector').click()
      cy.get('#submit').click();

      cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 5)
      cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'COLLECTOR')
      cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'SITE LOCATION')
    });

    context("Presets", () => {
      it("General Inventory", () => {
        cy.get('#edit-columns').click()
        cy.get('#General\\ Inventory').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 19)
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'RECEIVED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'COLLECTED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'COLLECTOR')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should('contain', 'SITE LOCATION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should('contain', 'ENDANGERED')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)').should('contain', 'RARE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)').should('contain', 'TREES COLLECTED FROM')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)').should('contain', 'ESTIMATED SEEDS INCOMING')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)').should('contain', 'LANDOWNER')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(14)').should('contain', 'STORAGE CONDITION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(15)').should('contain', 'NUMBER OF SEEDS WITHDRAWN')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(16)').should('contain', 'NUMBER OF SEEDS REMAINING')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(17)').should('contain', 'MOST RECENT GERMINATION TEST DATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(18)').should('contain', 'MOST RECENT % VIABILITY')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(19)').should('contain', 'TOTAL ESTIMATED % VIABILITY')
      })

      it("Default", () => {
        cy.get('#edit-columns').click()
        cy.get('#General\\ Inventory').click();
        cy.get('#Default').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 7)
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'RECEIVED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'COLLECTED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'SITE LOCATION')
      })

      it("Seed Storage Status", () => {
        cy.get('#edit-columns').click()
        cy.get('#Seed\\ Storage\\ Status').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 14)
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'RECEIVED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'COLLECTED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'ESTIMATED SEEDS INCOMING')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should('contain', 'STORING START DATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should('contain', 'STORAGE CONDITION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)').should('contain', 'STORAGE LOCATION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)').should('contain', 'NUMBER OF STORAGE PACKETS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)').should('contain', 'NOTES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)').should('contain', 'NUMBER OF SEEDS REMAINING')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(14)').should('contain', 'MOST RECENT % VIABILITY')
      })

      it("Viability Summary", () => {
        cy.get('#edit-columns').click()
        cy.get('#Viability\\ Summary').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 18)
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'COLLECTED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'GERMINATION TEST TYPE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'SEED TYPE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should('contain', 'GERMINATION TREATMENT')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should('contain', 'NUMBER OF SEEDS FILLED')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)').should('contain', 'NOTES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)').should('contain', 'NUMBER OF SEEDS SOWN')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)').should('contain', 'TOTAL OF SEEDS GERMINATED')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)').should('contain', 'NUMBER OF SEEDS EMPTY')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(14)').should('contain', 'GERMINATION SUBSTRATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(15)').should('contain', 'TOTAL % OF SEEDS GERMINATED')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(16)').should('contain', 'NUMBER OF SEEDS COMPROMISED')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(17)').should('contain', 'MOST RECENT % VIABILITY')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(18)').should('contain', 'TOTAL ESTIMATED % VIABILITY')        
      })

      it("Germination Testing To Do", () => {
        cy.get('#edit-columns').click()
        cy.get('#Germination\\ Testing\\ To\\ Do').click();
        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 11)
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'COLLECTED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'STORAGE CONDITION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'STORAGE LOCATION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should('contain', 'NUMBER OF STORAGE PACKETS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should('contain', 'NOTES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)').should('contain', 'GERMINATION TEST TYPE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)').should('contain', 'GERMINATION START DATE')
      })

      it("Custom", () => {
        cy.get('#edit-columns').click()
        cy.get('#Germination\\ Testing\\ To\\ Do').click();

        cy.get('#primaryCollector').click();
        cy.get('#rare').click();

        cy.get('#submit').click();

        cy.get('.MuiTableHead-root > .MuiTableRow-root').children().should('have.length', 13)
        cy.get('[aria-sort="ascending"]').should('contain', 'ACCESSION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(2)').should('contain', 'STATUS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').should('contain', 'STATE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(4)').should('contain', 'SPECIES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(5)').should('contain', 'COLLECTED ON')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(6)').should('contain', 'COLLECTOR')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(7)').should('contain', 'RARE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(8)').should('contain', 'STORAGE CONDITION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(9)').should('contain', 'STORAGE LOCATION')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(10)').should('contain', 'NUMBER OF STORAGE PACKETS')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(11)').should('contain', 'NOTES')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(12)').should('contain', 'GERMINATION TEST TYPE')
        cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(13)').should('contain', 'GERMINATION START DATE')
      })
    });
    
  })

})