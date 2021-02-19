/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Lab", () => {
    it("should not create Lab menu if not selecting any test", () => {
        cy.visit("/accessions/new")      
        cy.get('#submit').click();

        cy.get('#lab').should('not.exist');
        });
    it("should create the accession with lab test and navigate to lab section", () => {
        cy.visit("/accessions/new")      
        cy.get('#submit').click();

        cy.get('#processing-drying > .MuiTypography-root').click();
        cy.get('#Lab > .MuiButtonBase-root > .MuiIconButton-label > input').click();
        cy.get('#submit').click().wait(4000);

        cy.get('#lab > .MuiTypography-root').click().url().should("match", /accessions\/[A-Za-z0-9]+\/lab/);
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
        cy.get('#notes').type("A lab test note");
        cy.get('#staffResponsible').type("Constanza");
        cy.get('.MuiBox-root > #submit').click().wait(2000);
        
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(3) > .MuiTypography-root').should('contain', 'Paper Petri Dish');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(6) > .MuiTypography-root').should('contain', 'Constanza');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(7) > .MuiTypography-root').children().should('have.length', 1);
        
    });

    it("should modify test", () => {
        cy.get(':nth-child(8) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();
        cy.get('#substrate').click();
        cy.get('[data-value="Nursery Media"]').click();
        cy.get('#notes').clear();
        cy.get('.MuiBox-root > #submit').click().wait(2000);

        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(3) > .MuiTypography-root').should('contain', 'Nursery Media');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(6) > .MuiTypography-root').should('contain', 'Constanza');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(7) > .MuiTypography-root').children().should('have.length', 0);
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
        cy.get('.MuiBox-root > #submit').click().wait(2000);

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
        cy.get('.MuiBox-root > #submit').click().wait(2000);

    });

    it("should display the records in the right order", () => {
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains("02/09/2021");
        cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1)').contains("02/12/2021");
        cy.get('.MuiTableBody-root > :nth-child(7) > :nth-child(1)').contains("02/01/2021");
  
        // by start date
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(1) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains("02/01/2021");
        cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1)').contains("02/09/2021");
         cy.get('.MuiTableBody-root > :nth-child(7) > :nth-child(1)').contains("02/12/2021");
  
        // by seed type

        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').contains("Fresh");
        cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(2)').contains("Stored");
         cy.get('.MuiTableBody-root > :nth-child(7) > :nth-child(2)').contains("Stored");
  
        // by substrate
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(3) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)').contains("Agar Petri Dish");
        cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(3)').contains("Nursery Media");
        cy.get('.MuiTableBody-root > :nth-child(7) > :nth-child(3)').contains("Other");
  
        // by Treatment
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(4) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(4)').contains("Other");
        cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(4)').contains("Scarify");
        cy.get('.MuiTableBody-root > :nth-child(7) > :nth-child(4)').contains("Soak");
  
        // by sown
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(5) > .MuiButtonBase-root').click();
        cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(5)').contains("50");
        cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(5)').contains("100");
        cy.get('.MuiTableBody-root > :nth-child(7) > :nth-child(5)').contains("200");
    })

    it("should delete test", () => {
        cy.get(':nth-child(7) > :nth-child(8) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();
        cy.get('.MuiTypography-body2').click().wait(4000);
        cy.get('.MuiTableBody-root > :nth-child(7)').should('not.exist');

    })

    it("should add germination entry and create bar in graph", () => {
        cy.get(':nth-child(2) > .MuiTableCell-root').click();
        cy.get('#newEntry').click();

        cy.get('#seedsGerminated').type('10');
        cy.get('#recordingDate').clear().type("02/09/2021");
        cy.get('.MuiBox-root > #submit').click().wait(4000);

        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(3) > .MuiTypography-root').should('contain', 'Nursery Media');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(6) > .MuiTypography-root').should('contain', 'Constanza');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(7) > .MuiTypography-root').children().should('have.length', 0);

        cy.get('#totalViabilityPercent').contains('6%');
        cy.get(':nth-child(2) > .MuiTableCell-root').click();

        cy.get('#totalSeedsGerminated').contains('10 (10%)');
        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(1) > .MuiTypography-root').should('contain', '10 seeds germinated');
        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get('.recharts-surface').should('exist')
        cy.get('.recharts-rectangle').should('have.length', 1)
    })

    it.skip("should add other germination entry and create a new bar on graph", () => {
        cy.get(':nth-child(2) > .MuiTableCell-root').click();
        cy.get('#newEntry').click();

        cy.get('#seedsGerminated').clear().type('15');
        cy.get('#recordingDate').clear().type("05/09/2021");
        cy.get('.MuiBox-root > #submit').click().wait(5000);

        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(3) > .MuiTypography-root').should('contain', 'Nursery Media');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(6) > .MuiTypography-root').should('contain', 'Constanza');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(7) > .MuiTypography-root').children().should('have.length', 0);

        cy.get('#totalViabilityPercent').contains('16%');
        cy.get(':nth-child(2) > :nth-child(2) > .MuiTableCell-root').click();
        cy.get('#totalSeedsGerminated').contains('25 (25%)');

        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(1) > .MuiTypography-root').contains('15 seeds germinated');
        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(2) > .MuiTypography-root').contains('05/09/2021');
        cy.get('.recharts-surface').should('exist')
        cy.get('.recharts-rectangle').should('have.length', 2)
    })

    it.skip("should modify entry", () => {
        cy.get(':nth-child(2) > :nth-child(2) > .MuiTableCell-root').click();
        cy.get(':nth-child(2) > :nth-child(3) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click()

        cy.get('#seedsGerminated').clear().type('25');
        cy.get('.MuiBox-root > #submit').click().wait(5000);

        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(3) > .MuiTypography-root').should('contain', 'Nursery Media');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(6) > .MuiTypography-root').should('contain', 'Constanza');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(7) > .MuiTypography-root').children().should('have.length', 0);

        cy.get('#totalViabilityPercent').contains('23%');
        cy.get(':nth-child(2) > :nth-child(2) > .MuiTableCell-root').click();

        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(1) > .MuiTypography-root').contains('25 seeds germinated');
        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(2) > .MuiTypography-root').contains('05/09/2021');
        cy.get('.recharts-surface').should('exist')
        cy.get('.recharts-rectangle').should('have.length', 2)
    })

    it.skip("should delete entry", () => {
        cy.get(':nth-child(2) > :nth-child(2) > .MuiTableCell-root').click();
        cy.get(':nth-child(2) > :nth-child(3) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();

        cy.get('.MuiLink-root > .MuiTypography-body2').click().wait(4000);

        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(1) > .MuiTypography-root').should('contain', '02/09/2021');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(2) > .MuiTypography-root').should('contain', 'Stored');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(3) > .MuiTypography-root').should('contain', 'Nursery Media');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(4) > .MuiTypography-root').should('contain', 'Scarify');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(5) > .MuiTypography-root').should('contain', '100');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(6) > .MuiTypography-root').should('contain', 'Constanza');
        cy.get(':nth-child(7) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > [tabindex="-1"] > :nth-child(7) > .MuiTypography-root').children().should('have.length', 0);

        cy.get('#totalViabilityPercent').contains('6%');

        cy.get(':nth-child(2) > .MuiTableCell-root').click();
        cy.get(':nth-child(4) > .MuiTable-root > .MuiTableBody-root > :nth-child(2)').should('not.exist');
        cy.get('.recharts-surface').should('exist')
        cy.get('.recharts-rectangle').should('have.length', 1)
    })

    it("should add cut test", () => {
        cy.get(':nth-child(4) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();

        cy.get('#cutTestSeedsFilled').type('15');
        cy.get('#cutTestSeedsEmpty').type('50');
        cy.get('#cutTestSeedsCompromised').type('10');
        cy.get('.MuiBox-root > #submit').click().wait(4000);

        cy.get(':nth-child(10) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > .MuiTypography-root').contains('15');
        cy.get(':nth-child(10) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root').contains('50');
        cy.get(':nth-child(10) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(3) > .MuiTypography-root').contains('10');
    })

    it("should modify cut test", () => {
        cy.get(':nth-child(4) > .MuiLink-root > .MuiBox-root > .MuiTypography-root').click();

        cy.get('#cutTestSeedsFilled').clear().type('500');
        cy.get('.MuiBox-root > #submit').click().wait(4000);

        cy.get(':nth-child(10) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > .MuiTypography-root').contains('500');
        cy.get(':nth-child(10) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root').contains('50');
        cy.get(':nth-child(10) > .MuiGrid-root > .MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(3) > .MuiTypography-root').contains('10');
    })
})