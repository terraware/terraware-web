/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Summary page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("has the summary title", () => {
    cy.get('.jss12').contains("Summary");
  });

  it("display endpoint result", () => {
    cy.wait(500)
    cy.get('#result').contains('{"activeAccessions":{"current":500,"lastWeek":550},"species":{"current":180,"lastWeek":150},"families":{"current":95,"lastWeek":90},"overduePendingAccessions":100,"overdueProcessedAccessions":70,"overdueDriedAccessions":50,"recentlyWithdrawnAccessions":10}');
  });

  context("navigation", () => {
    it("navigates to database page", () => {
      cy.get('[href="/accessions"]').click().url().should("contain", "/accessions");
    });
  });

});
