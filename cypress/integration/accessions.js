/* eslint-disable no-console */
/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Accessions", () => {
  context("Navigation", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("should navigate in and out of the new accession page", () => {
      cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
      cy.get('.MuiBox-root > .MuiButtonBase-root').click().url().should("contain", "/");
  
      cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
      cy.get('#cancel').click().url().should("contain", "/");
    });
  
    it("should handle the cancel button", () => {
      cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
      cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/");
    });
  });

  context("Accessions", () => {
    it("should create the accession", () => {
      cy.visit("/");
      cy.get('.MuiTypography-root > .MuiButtonBase-root').click().url().should("contain", "/accessions/new");
  
      cy.get('#species').type("Kousa Dogwoord");
      cy.get('#family').type("Cornaceae");
      cy.get('#numberOfTrees').type("3");
      cy.get('#founderId').type("234908098");
      cy.get('#endangered > .MuiButtonBase-root > .MuiIconButton-label').click();
      cy.get('#rare > .MuiButtonBase-root > .MuiIconButton-label').click();
  
      cy.get('#fieldNotes').type("Some notes");
  
      cy.get('#collectedDate').type("02/01/2021");
      cy.get('#receivedDate').type("02/03/2021");
  
      cy.get('#primaryCollector').type("Carlos");
      cy.get('#secondaryCollectors\\[0\\]').type("Constanza");
      cy.get(':nth-child(14) > :nth-child(2) > .MuiTypography-root').click()
      cy.get('#secondaryCollectors\\[1\\]').type("Leann");
  
      cy.get('#siteLocation').type("Sunset Overdrive");
      cy.get('#landowner').type("Yacin");
      cy.get('#environmentalNotes').type("Cold day");
  
      cy.get('#submit').click().url().should("match", /accessions\/[A-Za-z0-9]+\/seed-collection/);

      cy.get('.MuiBox-root-97 > .MuiTypography-root').contains("Active");
      cy.get('.MuiBox-root-97 > .MuiTypography-root').contains("Kousa Dogwoord");
      cy.get('.MuiBox-root-97 > .MuiTypography-root').contains("02/03/2021");
      cy.get('.MuiBox-root-97 > .MuiTypography-root').contains("Pending");

      cy.get('#species').should('have.value', "Kousa Dogwoord");
      cy.get('#family').should('have.value', "Cornaceae");
      cy.get('#numberOfTrees').should('have.value', "3");
      cy.get('#founderId').should('have.value', "234908098");
      cy.get('#check-endangered').should('have.checked', "true");
      cy.get('#check-rare').should('have.checked', "true");

      cy.get('#fieldNotes').should('have.value', "Some notes");
  
      cy.get('#collectedDate').should('have.value', "02 / 01 / 2021");
      cy.get('#receivedDate').should('have.value', "02 / 03 / 2021");
  
      cy.get('#primaryCollector').should('have.value', "Carlos");
      cy.get('#secondaryCollectors\\[0\\]').should('have.value', "Constanza");
      cy.get('#secondaryCollectors\\[1\\]').should('have.value', "Leann");
  
      cy.get('#siteLocation').should('have.value', "Sunset Overdrive");
      cy.get('#landowner').should('have.value', "Yacin");
      cy.get('#environmentalNotes').should('have.value', "Cold day");
    });
  
    it("should update the accession", () => {
      cy.get('#delete-secondaryCollectors\\[1\\]').click();
      cy.get('#primaryCollector').clear().type("Leann");
      cy.get('#fieldNotes').clear().type("Other notes");

      cy.get('#submit').click().url().should("match", /accessions\/[A-Za-z0-9]+\/seed-collection/).wait(2000);

      cy.get('#fieldNotes').contains('Other notes');
      cy.get('#secondaryCollectors\\[1\\]').should('not.exist');
      cy.get('#primaryCollector').should('have.value', 'Leann');
    })

    it("should add processing and drying information", () => {
      cy.get('#processing-drying > .MuiTypography-root').click().url().should("match", /accessions\/[A-Za-z0-9]+\/processing-drying/);
      cy.get('#processingStartDate').type("01/01/2021");
      cy.get('#processingMethod').click()
      cy.get('.MuiList-root > [tabindex="0"]').click()
      cy.get('#seedsCounted').type(300);
      cy.get('#Nursery > .MuiButtonBase-root > .MuiIconButton-label > input').click();
      cy.get('#Nursery > .MuiButtonBase-root').should('have.class', 'Mui-checked');
      cy.get('#dryingStartDate').type("01/01/2021");
      cy.get('#dryingEndDate').type("01/01/2021");
      cy.get('#dryingMoveDate').type("01/01/2021");
      cy.get('#processingNotes').type("A processing note");
      cy.get('#processingStaffResponsible').type("Constanza");

      cy.get('#submit').click().wait(2000);

      cy.get('#processingStartDate').should('have.value', '01 / 01 / 2021');
      cy.get('#processingMethod + input').should('have.value', 'Count');
      cy.get('#seedsCounted').should('have.value', '300');
      cy.get('#Nursery > .MuiButtonBase-root').should('have.class', 'Mui-checked');
      cy.get('#dryingStartDate').should('have.value', '01 / 01 / 2021');
      cy.get('#dryingEndDate').should('have.value', '01 / 01 / 2021');
      cy.get('#dryingMoveDate').should('have.value', '01 / 01 / 2021');
      cy.get('#processingNotes').should('have.value', 'A processing note');
      cy.get('#processingStaffResponsible').should('have.value', 'Constanza');
    })

    it("should clear textfield if changing dropdown", () => {
      cy.get('#processingMethod').click();
      cy.get('.MuiList-root > [tabindex="-1"]').click();
      
      cy.get('#subsetWeightGrams').type(500);
      cy.get('#subsetCount').type(500);
      cy.get('#totalWeightGrams').type(500);
      cy.get('#estimatedSeedCount').should('have.value', '500');

      cy.get('#submit').click().wait(2000);
      cy.get('#subsetWeightGrams').should('have.value', '500');
      cy.get('#estimatedSeedCount').should('have.value', '500');

      cy.get('#processingMethod').click();
      cy.get('.MuiList-root > [tabindex="-1"]').click();

      cy.get('#seedsCounted').should('have.value', '');
      cy.get('#seedsCounted').type(400);
      
      cy.get('#processingMethod').click();
      cy.get('.MuiList-root > [tabindex="-1"]').click();

      cy.get('#subsetWeightGrams').should('have.value', '');

      cy.get('#processingMethod').click();
      cy.get('.MuiList-root > [tabindex="-1"]').click();

      cy.get('#seedsCounted').should('have.value', '');
    });

    it("should add storage information", () => {
      cy.get('#storage > .MuiTypography-root').click().url().should("match", /accessions\/[A-Za-z0-9]+\/storage/);
      cy.get('#storageStartDate').type("02/04/2021");
      cy.get('#storagePackets').type("5");
      cy.get('#storageLocation').click();
      cy.get('[data-value="Freezer 1"]').click();
      cy.get('#storageCondition').should('have.value', 'Freezer');

      cy.get('#storageLocation').click();
      cy.get('[data-value="Refrigerator 2"]').click();
      cy.get('#storageCondition').should('have.value', 'Refrigerator');

      cy.get('#storageNotes').type("A storage note");
      cy.get('#storageStaffResponsible').type("Constanza");

      cy.get('#submit').click().wait(2000);

      cy.get('#storageStartDate').should('have.value', '02 / 04 / 2021');
      cy.get('#storagePackets').should('have.value', '5');
      cy.get('#storageLocation + input').should('have.value', 'Refrigerator 2');
      cy.get('#storageCondition').should('have.value', 'Refrigerator');
      cy.get('#storageNotes').should('have.value', 'A storage note');
      cy.get('#storageStaffResponsible').should('have.value', 'Constanza');
    });
  });

});
