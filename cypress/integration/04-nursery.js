/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Nursery", () => {
    it("should not create Germination menu if not selecting any test", () => {
        cy.visit("/accessions/new")      
        cy.get('#submit').click();

        cy.get('#nursery').should('not.exist');
        });
    it("should create the accession with nursery test and navigate to nursery section", () => {
        cy.visit("/accessions/new")      
        cy.get('#submit').click();

        cy.get('#processing-drying > .MuiTypography-root').click();
        cy.get('#Nursery > .MuiButtonBase-root > .MuiIconButton-label > input').click();
        cy.get('#submit').click().wait(2000);

        cy.get('#nursery > .MuiTypography-root').click().url().should("match", /accessions\/[A-Za-z0-9]+\/nursery/);
        });
    it("should create a new test", () => {
        cy.get('#submit').click();
        cy.get('#startDate').type("02/09/2021");
        cy.get('#seedType').click();
        cy.get('.MuiList-root > [tabindex="-1"]').click();
        cy.get('#substrate').click();
        cy.get('[data-value="Paper Petri Dish"]').click();
        cy.get('#treatment').click();
        cy.get('[data-value="Scarify"]').click();
        cy.get('#seedsSown').type("100");
        cy.get('#seedsGerminated').type("50");
        cy.get('#recordingDate').type("02/09/2021");
        cy.get('#notes').type("A nursery test note");
        cy.get('#staffResponsible').type("Constanza");
        cy.get('.MuiBox-root > #submit').should('contain', 'Create test');
        cy.get('.MuiBox-root > #submit').click().wait(2000);

        cy.get('.MuiTableBody-root').children().should('have.length', 1);
        cy.get('#totalViabilityPercent').should('contain', '50%');

        cy.get('.MuiTableRow-root > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get('.MuiTableRow-root > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get('.MuiTableRow-root > :nth-child(3) > .MuiTypography-root').should('contain', 'Paper Petri Dish');
        cy.get('.MuiTableRow-root > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get('.MuiTableRow-root > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get('.MuiTableRow-root > :nth-child(6) > .MuiTypography-root').should('contain', '50');
        cy.get('.MuiTableRow-root > :nth-child(7) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get('.MuiTableRow-root > :nth-child(8) > .MuiTypography-root').children().should('have.length', 1);
        
    });

    it("should modify test", () => {
        cy.get(':nth-child(1) > :nth-child(9) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();
        cy.get('#substrate').click();
        cy.get('[data-value="Nursery Media"]').click();
        cy.get('#seedsGerminated').clear().type("70");
        cy.get('#recordingDate').clear().type("02/10/2021");
        cy.get('#notes').clear();
        cy.get('.MuiBox-root > #submit').should('contain', 'Save changes');
        cy.get('.MuiBox-root > #submit').click().wait(2000);

        cy.get('.MuiTableBody-root').children().should('have.length', 1);
        cy.get('#totalViabilityPercent').should('contain', '70%');

        cy.get('.MuiTableRow-root > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get('.MuiTableRow-root > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get('.MuiTableRow-root > :nth-child(3) > .MuiTypography-root').should('contain', 'Nursery Media');
        cy.get('.MuiTableRow-root > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get('.MuiTableRow-root > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get('.MuiTableRow-root > :nth-child(6) > .MuiTypography-root').should('contain', '70');
        cy.get('.MuiTableRow-root > :nth-child(7) > .MuiTypography-root').should('contain', '02/10/2021');
        cy.get('.MuiTableRow-root > :nth-child(8) > .MuiTypography-root').children().should('have.length', 0);
    });

    it("should create another test", () => {
        cy.get('#submit').click();
        cy.get('#startDate').type("02/12/2021");
        cy.get('#seedType').click();
        cy.get('.MuiList-root > [tabindex="-1"]').click();
        cy.get('#substrate').click();
        cy.get('[data-value="Agar Petri Dish"]').click();
        cy.get('#treatment').click();
        cy.get('[data-value="Soak"]').click();
        cy.get('#seedsSown').type("200");
        cy.get('#seedsGerminated').type("100");
        cy.get('#recordingDate').type("02/15/2021");
        cy.get('.MuiBox-root > #submit').click().wait(2000);

        cy.get('.MuiTableBody-root').children().should('have.length', 2);
    });

    it("should create another test", () => {
        cy.get('#submit').click();
        cy.get('#startDate').type("02/01/2021");
        cy.get('#seedType').click();
        cy.get('[data-value="Fresh"]').click();
        cy.get('#substrate').click();
        cy.get('[data-value="Other"]').click();
        cy.get('#treatment').click();
        cy.get('[data-value="Other"]').click();
        cy.get('#seedsSown').type("50");
        cy.get('#seedsGerminated').type("45");
        cy.get('#recordingDate').type("01/25/2021");
        cy.get('.MuiBox-root > #submit').click().wait(2000);

        cy.get('.MuiTableBody-root').children().should('have.length', 3);
    });

    it("should display the records in the right order", () => {
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains("02/09/2021");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(1)').contains("02/12/2021");
        cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(1)').contains("02/01/2021");
  
        // by start date
        cy.get('.MuiTableRow-root > :nth-child(1) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains("02/01/2021");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(1)').contains("02/09/2021");
         cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(1)').contains("02/12/2021");
  
        // by seed type
        cy.get('.MuiTableRow-root > :nth-child(2) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').contains("Fresh");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(2)').contains("Stored");
         cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(2)').contains("Stored");
  
        // by substrate
        cy.get('.MuiTableRow-root > :nth-child(3) > .MuiButtonBase-root').click()
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)').contains("Agar Petri Dish");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(3)').contains("Nursery Media");
         cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(3)').contains("Other");
  
  
        // by Treatment
        cy.get('.MuiTableRow-root > :nth-child(4) > .MuiButtonBase-root').click()
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(4)').contains("Other");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(4)').contains("Scarify");
        cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(4)').contains("Soak");
  
        // by sown
        cy.get('.MuiTableRow-root > :nth-child(5) > .MuiButtonBase-root').click()
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(5)').contains("50");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(5)').contains("100");
        cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(5)').contains("200");

        // by germinated
        cy.get('.MuiTableRow-root > :nth-child(6) > .MuiButtonBase-root').click()
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(6)').contains("45");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(6)').contains("70");
        cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(6)').contains("100");

        // by recording date
        cy.get('.MuiTableRow-root > :nth-child(7) > .MuiButtonBase-root').click()
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(7)').contains("01/25/2021");
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(7)').contains("02/10/2021");
        cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(7)').contains("02/15/2021");
    })

    it("should delete test", () => {
        cy.get(':nth-child(2) > :nth-child(9) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();
        cy.get('.MuiTypography-body2').click().wait(2000);
        cy.get('.MuiTableBody-root').children().should('have.length', 2);
    })
})