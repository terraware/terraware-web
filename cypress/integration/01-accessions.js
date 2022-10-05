describe('Accessions', () => {
  context('Summary Start Results', () => {
    beforeEach(() => {
      cy.visit('/seeds-dashboard');
    });
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');
      cy.visit('/seeds-dashboard');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('3');

      cy.get('#species-current').contains('2');
    });
  });

  context('Navigation', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.visit('/accessions');
      cy.wait('@search');
    });

    it('should navigate in and out of the new accession page', () => {
      cy.get('#newAccession').click();
      cy.get('#seedBank').click();
      cy.get('ul')
        .children()
        .each(($el, index) => {
          if (index === 0) $el.click();
        });
      cy.get('#select-seed-bank').click().url().should('contain', '/accessions/new');
      cy.get('#closenewAccession').click().url().should('contain', '/');

      cy.get('#newAccession').click();
      cy.get('#seedBank').click();
      cy.get('ul')
        .children()
        .each(($el, index) => {
          if (index === 0) $el.click();
        });
      cy.get('#select-seed-bank').click().url().should('contain', '/accessions/new');
      cy.get('#cancelButton').click().url().should('contain', '/');
    });
  });

  context('Accessions', () => {
    it('should create the accession', () => {
      cy.intercept('POST', '/api/v1/search').as('search');
      cy.visit('/accessions');
      cy.wait('@search');
      cy.get('#newAccession').click();
      cy.get('#seedBank').click();
      cy.get('ul')
        .children()
        .each(($el, index) => {
          if (index === 0) $el.click();
        });
      cy.get('#select-seed-bank').click().url().should('contain', '/accessions/new');

      cy.get('#species').type('Kousa Dogwood{downArrow}{enter}');
      cy.get('#numberOfTrees').type('3');
      cy.get('#founderId').type('234908098');
      cy.get('#collectionSource').click();
      cy.get('#Outplant').click();

      cy.get('#fieldNotes').type('Some notes');
      cy.get('#collectedDate').type('2021-02-01');
      cy.get('#receivedDate').clear().type('2021-02-03');
      cy.get('#collector0').type('Carlos');
      cy.get('#addCollectorButton').click();
      cy.get('#collector1').type('Constanza');
      cy.get('#addCollectorButton').click();
      cy.get('#collector2').type('Leann');
      cy.get('#collectionSiteName').type('Sunset Overdrive');
      cy.get('#collectionSiteLandowner').type('Yacin');
      cy.get('#collectionSiteNotes').type('Cold day');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');
      cy.wait(5000);
      cy.get('#snackbar').should('not.exist');
      cy.url().should('match', /accessions\/[A-Za-z0-9]+\/seed-collection/);

      cy.get('#header-status').contains('Active');
      cy.get('#header-species').contains('Kousa Dogwood');
      cy.get('#header-date').contains('2021-02-03');
      cy.get('#header-state').contains('Awaiting Check-In');

      cy.get('#species').should('have.value', 'Kousa Dogwood');
      cy.get('#numberOfTrees').should('have.value', '3');
      cy.get('#founderId').should('have.value', '234908098');
      cy.get('#collectionSource + input').should('have.value', 'Outplant');
      cy.get('#fieldNotes').should('have.value', 'Some notes');
      cy.get('#collectedDate').should('have.value', '2021-02-01');
      cy.get('#receivedDate').should('have.value', '2021-02-03');
      cy.get('#collector0 > input').should('have.value', 'Carlos');
      cy.get('#collector1 > input').should('have.value', 'Constanza');
      cy.get('#collector2 > input').should('have.value', 'Leann');
      cy.get('#collectionSiteName').should('have.value', 'Sunset Overdrive');
      cy.get('#collectionSiteLandowner').should('have.value', 'Yacin');
      cy.get('#collectionSiteNotes').should('have.value', 'Cold day');
    });

    it('should check in the accession', () => {
      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.intercept('POST', '/api/v1/seedbank/accessions/*/checkIn').as('checkInAccession');
      cy.get('#checkIn').click();
      cy.wait('@checkInAccession');
      cy.wait('@getAccession');
      cy.get('#checkIn').should('contain', 'Checked In!');
      cy.get('#header-state').contains('Pending');
    });

    it('should update the accession', () => {
      cy.get('#delete-collector2').click();
      cy.get('#collector0 > input').clear().type('Leann');
      cy.get('#fieldNotes').clear().type('Other notes');

      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.wait('@getAccession');

      cy.get('#fieldNotes').contains('Other notes');
      cy.get('#collector2').should('not.exist');
      cy.get('#collector0 > input').should('have.value', 'Leann');
    });

    it('should send the accession to Nursery', () => {
      cy.get('#sendToNursery').should('contain', 'Send to Nursery');
      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#sendToNursery').click();
      cy.get('#sendToNursery').should('contain', 'Sending');
      cy.wait('@getAccession');

      cy.get('#sendToNursery').should('contain', 'Sent to Nursery');
      cy.get('#undoSendToNursery').should('exist');
      cy.get('#goToDatabase').should('exist');
    });

    it('should unsend the accession to Nursery', () => {
      cy.get('#undoSendToNursery').should('exist');
      cy.intercept('GET', 'api/v1/seedbank/accessions/*').as('getAccession');
      cy.get('#undoSendToNursery').click();
      cy.wait('@getAccession');
      cy.get('#sendToNursery').should('exist');
    });
  });

  context('Mobile dropoff', () => {
    it('should show the mobile imported info', () => {
      cy.visit('/accessions/1002/seed-collection');

      cy.get('#bag0').contains('ABCD001237');
      cy.get('#bag1').contains('ABCD001238');
      cy.get('#location0').contains('9.03, -79.53');

      cy.get('#photo-0').contains('accession1.jpg');
      cy.get('#photo-0')
        .should('have.attr', 'href', '/api/v1/seedbank/accessions/1002/photos/accession1.jpg')
        .should('have.attr', 'target', '_blank');

      cy.get('#photo-1').contains('accession2.jpg');
      cy.get('#photo-1')
        .should('have.attr', 'href', '/api/v1/seedbank/accessions/1002/photos/accession2.jpg')
        .should('have.attr', 'target', '_blank');

      // cy.request({
      //   url: Cypress.config().baseUrl + '/api/v1/seedbank/accessions/1002/photos/accession1.jpg',
      //   headers: { 'X-Forwarded-User': 'dummy-auth-id' },
      // })
      //   .its('status')
      //   .should('eq', 200);
      // cy.request({
      //   url: Cypress.config().baseUrl + '/api/v1/seedbank/accessions/1002/photos/accession2.jpg',
      //   headers: { 'X-Forwarded-User': 'dummy-auth-id' },
      // })
      //   .its('status')
      //   .should('eq', 200);
    });
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary?organizationId=*').as('summary');
      cy.visit('/seeds-dashboard');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('4');

      cy.get('#species-current').contains('2');
    });
  });
});
