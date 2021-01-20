/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Summary page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("has the summary title", () => {
    cy.get('.MuiTypography-h2').contains("Summary");
  });

  it.skip("display endpoint result", () => {
    cy.wait(500)
    cy.get('.MuiTypography-h4').contains('{"droppedOff":100,"processed":70,"dried":50,"withdrawn":10}');
  });

  context("navigation", () => {
    it("navigates to database page", () => {
      cy.get('[href="/database"]').click().url().should("contain", "/database");
    });
  });

});
