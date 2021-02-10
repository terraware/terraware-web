/* eslint-disable no-console */
/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Withdrawal", () => {

  context("quantity by seed", () => {
    it("should create the accession", () => {
      cy.visit("/accessions/new")      
      cy.get('#submit').click();

      cy.get('#processing-drying > .MuiTypography-root').click();
      cy.get('#processingMethod').click()
      cy.get('.MuiList-root > [tabindex="0"]').click()
      cy.get('#seedsCounted').type(300);
      cy.get('#submit').click().wait(2000);

      cy.get('#withdrawal > .MuiTypography-root').click().url().should("match", /accessions\/[A-Za-z0-9]+\/withdrawal/);
    });

    it("should display the initial values", () => {
      cy.get(':nth-child(6) > :nth-child(1) > .MuiBox-root').contains("300")
      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("0")
      cy.get(':nth-child(3) > .MuiBox-root').contains("300")
    })

    it("should create a withdrawal ", () => {
      cy.get('#submit').click();
      cy.get('.MuiBox-root > #submit').contains('Withdraw seeds')
      cy.get(':nth-child(3) > .MuiTypography-root').contains('You can schedule a date by selecting a future date.')
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("300")
      cy.get('#quantityType').contains("seed count")
      cy.get('#quantityType').click()
      cy.get('.MuiList-root > [tabindex="1"]').should('not.exist');
      cy.get('.MuiList-root > [tabindex="0"]').click()

      cy.get('#quantity').type("50");
      cy.get('#date').clear().type("01/31/2030");
      cy.get('.MuiBox-root > #submit').contains('Schedule withdrawal')
      cy.get(':nth-child(3) > .MuiTypography-root').contains('Scheduling for: January 31st, 2030')
      cy.get('#destination').type("Panama");
      cy.get('#purpose').click()
      cy.get('[data-value="Outreach or Education"]').click()
      cy.get('#notes').type("Some notes");
      cy.get('#staffResponsible').type("Carlos");
      cy.get('.MuiBox-root > #submit').click().wait(2000);

      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("50")
      cy.get(':nth-child(3) > .MuiBox-root').contains("250")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > :nth-child(1)').contains("Scheduled for")
      cy.get('.MuiTableRow-root > :nth-child(1) > :nth-child(2)').contains("01/31/2030")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(2)').contains("50 seeds")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(3)').contains("Panama")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(4)').contains("Outreach or Education")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(5)').contains("Carlos")
      cy.get(':nth-child(6) > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
    })

    it("should edit a withdrawal ", () => {
      cy.get('.MuiLink-root > .MuiBox-root').click();
      cy.get('.MuiBox-root > #submit').contains('Save changes')
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("250")
      
      cy.get('#quantity').clear().type("10");
      cy.get('#date').clear().type("01/29/2020");
      cy.get('#destination').clear().type("USA");
      cy.get('#purpose').click()
      cy.get('[data-value="Research"]').click()
      cy.get('#notes').clear();
      cy.get('#staffResponsible').clear().type("Leann");
      cy.get('.MuiBox-root > #submit').click().wait(2000);

      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("10")
      cy.get(':nth-child(3) > .MuiBox-root').contains("290")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > :nth-child(1)').contains("01/29/2020")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(2)').contains("10 seeds")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(3)').contains("USA")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(4)').contains("Research")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(5)').contains("Leann")
      cy.get(':nth-child(6) > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
    })

    it("should delete the withdrawal ", () => {
      cy.get('.MuiLink-root > .MuiBox-root').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("290")

      cy.get('.MuiLink-root > .MuiTypography-body2').click().wait(2000);

      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("0")
      cy.get(':nth-child(3) > .MuiBox-root').contains("300")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(1)').should('not.exist');
    })


    it("should do the right math when adding withdrawals", () => {
      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("300")
      
      cy.get('#quantity').type("50");
      cy.get('#date').clear().type("01/31/2030");
      cy.get('#destination').type("Panama");
      cy.get('#purpose').click()
      cy.get('[data-value="Outreach or Education"]').click()
      cy.get('#notes').type("Some notes");
      cy.get('#staffResponsible').type("Carlos");
      cy.get('.MuiBox-root > #submit').click().wait(2000);
      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("50")
      cy.get(':nth-child(3) > .MuiBox-root').contains("250")
      cy.get(':nth-child(3) > .MuiBox-root').should('have.css', 'background-color', 'rgb(117, 117, 117)')

      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("250")
      cy.get('#quantity').type("150");
      cy.get('#date').clear().type("01/31/2020");
      cy.get('#destination').type("USA");
      cy.get('#purpose').click()
      cy.get('[data-value="Research"]').click()
      cy.get('#notes').type("Other notes");
      cy.get('#staffResponsible').type("Leann");
      cy.get('.MuiBox-root > #submit').click().wait(2000);
      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("200")
      cy.get(':nth-child(3) > .MuiBox-root').contains("100")
      cy.get(':nth-child(3) > .MuiBox-root').should('have.css', 'background-color', 'rgb(117, 117, 117)')

      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("100")
      cy.get('#quantity').type("100");
      cy.get('#date').clear().type("03/28/2020");
      cy.get('#destination').type("Paris");
      cy.get('#purpose').click()
      cy.get('[data-value="Propagation"]').click()
      cy.get('#staffResponsible').type("Constanza");
      cy.get('.MuiBox-root > #submit').click().wait(2000);
      cy.get(':nth-child(10) > :nth-child(2) > .MuiBox-root').contains("300")
      cy.get(':nth-child(3) > .MuiBox-root').contains("0")
      cy.get(':nth-child(3) > .MuiBox-root').should('have.css', 'background-color', 'rgb(203, 94, 60)')

      cy.get('#submit').should('have.css', 'background-color', 'rgb(158, 158, 158)')
      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').should('not.exist');
    })
  });

  context("quantity by grams", () => {
    it("should create the accession", () => {
      cy.visit("/accessions/new");
      cy.get('#submit').click().wait(2000);

      cy.get('#processing-drying > .MuiTypography-root').click();
      cy.get('#processingMethod').click()
      cy.get('.MuiList-root > [tabindex="-1"]').click();

      cy.get('#subsetWeightGrams').type(100);
      cy.get('#subsetCount').type(10);
      cy.get('#totalWeightGrams').type(100);
      cy.get('#submit').click().wait(2000);

      cy.get('#withdrawal > .MuiTypography-root').click();
    });

    it("should display the initial values", () => {
      cy.get(':nth-child(6) > :nth-child(1) > .MuiBox-root').contains("10")
      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("0")
      cy.get(':nth-child(3) > .MuiBox-root').contains("10")
    })

    it("should create a withdrawal ", () => {
      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("10")
      cy.get('#quantityType').contains("seed count")
      cy.get('#quantityType').click()
      cy.get('.MuiList-root > [tabindex="0"]').click()

      cy.get('#quantity').type("2");
      cy.get('#date').clear().type("01/31/2030");
      cy.get('#destination').type("Panama");
      cy.get('#purpose').click()
      cy.get('[data-value="Outreach or Education"]').click()
      cy.get('#notes').type("Some notes");
      cy.get('#staffResponsible').type("Carlos");
      cy.get('.MuiBox-root > #submit').click().wait(2000);

      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("2")
      cy.get(':nth-child(3) > .MuiBox-root').contains("8")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > :nth-child(1)').contains("Scheduled for")
      cy.get('.MuiTableRow-root > :nth-child(1) > :nth-child(2)').contains("01/31/2030")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(2)').contains("2 seeds")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(3)').contains("Panama")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(4)').contains("Outreach or Education")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(5)').contains("Carlos")
      cy.get(':nth-child(6) > .MuiTypography-root > .MuiSvgIcon-root').should('exist');
    })

    it("should edit a withdrawal ", () => {
      cy.get('.MuiLink-root > .MuiBox-root').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("8")
      
      cy.get('#quantityType').click()
      cy.get('.MuiList-root > [tabindex="-1"]').click()
      cy.get('#quantityType').contains("g (gram)")

      cy.get('#quantity').clear().type("30");
      cy.get('#date').clear().type("01/29/2020");
      cy.get('#destination').clear().type("USA");
      cy.get('#purpose').click()
      cy.get('[data-value="Research"]').click()
      cy.get('#notes').clear();
      cy.get('#staffResponsible').clear().type("Leann");
      cy.get('.MuiBox-root > #submit').click().wait(2000);

      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("3")
      cy.get(':nth-child(3) > .MuiBox-root').contains("7")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(1) > :nth-child(1)').contains("01/29/2020")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(2)').contains("30g")

      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(3)').contains("USA")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(4)').contains("Research")
      cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(5)').contains("Leann")
      cy.get(':nth-child(6) > .MuiTypography-root > .MuiSvgIcon-root').should('not.exist');
    })

    it("should do the right math when adding withdrawals", () => {
      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("7")
      
      cy.get('#quantity').type("3");
      cy.get('#date').clear().type("01/31/2030");
      cy.get('#destination').type("Panama");
      cy.get('#purpose').click()
      cy.get('[data-value="Outreach or Education"]').click()
      cy.get('#notes').type("Some notes");
      cy.get('#staffResponsible').type("Carlos");
      cy.get('.MuiBox-root > #submit').click().wait(2000);
      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("6")
      cy.get(':nth-child(3) > .MuiBox-root').contains("4")
      cy.get(':nth-child(3) > .MuiBox-root').should('have.css', 'background-color', 'rgb(117, 117, 117)')

      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("4")
      cy.get('#quantity').type("1");
      cy.get('#date').clear().type("01/31/2020");
      cy.get('#destination').type("USA");
      cy.get('#purpose').click()
      cy.get('[data-value="Research"]').click()
      cy.get('#notes').type("Other notes");
      cy.get('#staffResponsible').type("Leann");
      cy.get('.MuiBox-root > #submit').click().wait(2000);
      cy.get(':nth-child(6) > :nth-child(2) > .MuiBox-root').contains("7")
      cy.get(':nth-child(3) > .MuiBox-root').contains("3")
      cy.get(':nth-child(3) > .MuiBox-root').should('have.css', 'background-color', 'rgb(117, 117, 117)')

      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').contains("3")
      cy.get('#quantityType').click()
      cy.get('.MuiList-root > [tabindex="-1"]').click()
      cy.get('#quantity').type("27");
      cy.get('#date').clear().type("03/28/2020");
      cy.get('#destination').type("Paris");
      cy.get('#purpose').click()
      cy.get('[data-value="Propagation"]').click()
      cy.get('#staffResponsible').type("Constanza");
      cy.get('.MuiBox-root > #submit').click().wait(2000);
      cy.get(':nth-child(10) > :nth-child(2) > .MuiBox-root').contains("10")
      cy.get(':nth-child(3) > .MuiBox-root').contains("0")
      cy.get(':nth-child(3) > .MuiBox-root').should('have.css', 'background-color', 'rgb(203, 94, 60)')

      cy.get('#submit').should('have.css', 'background-color', 'rgb(158, 158, 158)')
      cy.get('#submit').click();
      cy.get('.MuiGrid-grid-xs-12 > .MuiBox-root').should('not.exist');
    })

    it("should display the records in the right order", () => {
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').contains("01/29/2020")
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(1)').contains("01/31/2020")
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(1)').contains("03/28/2020")
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1) > :nth-child(1)').contains("Scheduled for")
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1) > :nth-child(2)').contains("01/31/2030")

      // by date
      cy.get('[aria-sort="ascending"] > .MuiButtonBase-root').click();
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1)').contains("01/29/2020")
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(1)').contains("01/31/2020")
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(1)').contains("03/28/2020")
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1) > :nth-child(1)').contains("Scheduled for")
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1) > :nth-child(2)').contains("01/31/2030")

      // by quantity
      cy.get('.MuiTableRow-root > :nth-child(2) > .MuiButtonBase-root').click();
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').contains("27g")
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(2)').contains("30g")
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(2)').contains("1 seeds")
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(2)').contains("3 seeds")

      // by destination
      cy.get('.MuiTableRow-root > :nth-child(3) > .MuiButtonBase-root').click()
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)').contains("Panama")
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(3)').contains("Paris")
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(3)').contains("USA")
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(3)').contains("USA")

      // by Purpose
      cy.get(':nth-child(4) > .MuiButtonBase-root').click();
      cy.get(':nth-child(4) > .MuiButtonBase-root').click();
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(4)').contains("Outreach or Education")
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(4)').contains("Propagation")
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(4)').contains("Research")
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(4)').contains("Research")

      // by staff
      cy.get(':nth-child(5) > .MuiButtonBase-root').click();
      cy.get(':nth-child(5) > .MuiButtonBase-root').click();
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(5)').contains("Leann")
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(5)').contains("Leann")
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(5)').contains("Constanza")
      cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(5)').contains("Carlos")
    })
  });

});
