describe('Accessions', () => {
  context('Summary Start Results', () => {
    beforeEach(() => {
      cy.visit('/seeds-summary');
    });
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary/*').as('summary');
      cy.visit('/seeds-summary');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('3');
      cy.get('#sessions-change').contains('0% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('4');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('1');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('0 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });

  context('Navigation', () => {
    beforeEach(() => {
      cy.visit('/accessions');
    });

    it('should navigate in and out of the new accession page', () => {
      cy.get('#newAccession').click().url().should('contain', '/accessions/new');
      cy.get('#closenewAccession').click().url().should('contain', '/');

      cy.get('#newAccession').click().url().should('contain', '/accessions/new');
      cy.get('#cancelButton').click().url().should('contain', '/');
    });
  });

  context('Accessions', () => {
    it('should create the accession', () => {
      cy.visit('/accessions');
      cy.get('#newAccession').click().url().should('contain', '/accessions/new');

      cy.get('#species').type('Kousa Dogwoord');
      cy.get('#family').type('Cornaceae');
      cy.get('#numberOfTrees').type('3');
      cy.get('#founderId').type('234908098');
      cy.get('#endangered').click();
      cy.get('#Yes').click();
      cy.get('#rare').click();
      cy.get('#Yes').click();
      cy.get('#sourcePlantOrigin').click();
      cy.get('#Outplant').click();

      cy.get('#fieldNotes').type('Some notes');
      cy.get('#collectedDate').type('02/01/2021');
      cy.get('#receivedDate').clear().type('02/03/2021');
      cy.get('#primaryCollector').type('Carlos');
      cy.get('#secondaryCollectors0').type('Constanza');
      cy.get('#addCollectorButton').click();
      cy.get('#secondaryCollectors1').type('Leann');
      cy.get('#siteLocation').type('Sunset Overdrive');
      cy.get('#landowner').type('Yacin');
      cy.get('#environmentalNotes').type('Cold day');

      cy.get('#saveAccession').click();
      cy.get('#snackbar').contains('Accession saved');
      cy.get('#snackbar').should('not.exist');
      cy.url().should('match', /accessions\/[A-Za-z0-9]+\/seed-collection/);

      cy.get('#header-status').contains('Active');
      cy.get('#header-species').contains('Kousa Dogwoord');
      cy.get('#header-date').contains('02/03/2021');
      cy.get('#header-state').contains('Awaiting Check-In');

      cy.get('#species').should('have.value', 'Kousa Dogwoord');
      cy.get('#family').should('have.value', 'Cornaceae');
      cy.get('#numberOfTrees').should('have.value', '3');
      cy.get('#founderId').should('have.value', '234908098');
      cy.get('#endangered + input').should('have.value', 'Yes');
      cy.get('#rare + input').should('have.value', 'Yes');
      cy.get('#sourcePlantOrigin + input').should('have.value', 'Outplant');
      cy.get('#fieldNotes').should('have.value', 'Some notes');
      cy.get('#collectedDate').should('have.value', '02/01/2021');
      cy.get('#receivedDate').should('have.value', '02/03/2021');
      cy.get('#primaryCollector').should('have.value', 'Carlos');
      cy.get('#secondaryCollectors0').should('have.value', 'Constanza');
      cy.get('#secondaryCollectors1').should('have.value', 'Leann');
      cy.get('#siteLocation').should('have.value', 'Sunset Overdrive');
      cy.get('#landowner').should('have.value', 'Yacin');
      cy.get('#environmentalNotes').should('have.value', 'Cold day');
    });

    it('should check in the accession', () => {
      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.intercept('POST', '/api/v1/seedbank/accession/*/checkIn').as('checkInAccession');
      cy.get('#checkIn').click();
      cy.wait('@checkInAccession');
      cy.wait('@getAccession');
      cy.get('#checkIn').should('contain', 'Checked In!');
      cy.get('#header-state').contains('Pending');
    });

    it('should update the accession', () => {
      cy.get('#delete-secondaryCollectors1').click();
      cy.get('#primaryCollector').clear().type('Leann');
      cy.get('#fieldNotes').clear().type('Other notes');

      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.wait('@getAccession');

      cy.get('#fieldNotes').contains('Other notes');
      cy.get('#secondaryCollectors1').should('not.exist');
      cy.get('#primaryCollector').should('have.value', 'Leann');
    });

    it('should send the accession to Nursery', () => {
      cy.get('#sendToNursery').should('contain', 'Send to Nursery');
      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.get('#sendToNursery').click();
      cy.get('#sendToNursery').should('contain', 'Sending');
      cy.wait('@getAccession');

      cy.get('#sendToNursery').should('contain', 'Sent to Nursery');
      cy.get('#undoSendToNursery').should('exist');
      cy.get('#goToDatabase').should('exist');
    });

    it('should unsend the accession to Nursery', () => {
      cy.get('#undoSendToNursery').should('exist');
      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.get('#undoSendToNursery').click();
      cy.wait('@getAccession');
      cy.get('#sendToNursery').should('exist');
    });

    it('should show autocomplete when typing and show modal when updating the species name and create a new species', () => {
      cy.get('#species').clear().type('Kousa Dogwoord New');
      cy.focused().should('have.attr', 'aria-controls', 'species-popup');

      cy.get('#saveAccession').click();
      cy.get('#speciesModal').should('exist');
      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.get('#cancel').click();
      cy.wait('@getAccession');

      cy.get('#species').should('have.value', 'Kousa Dogwoord New');
    });

    it('should not show modal if updating the species name with an existant species', () => {
      cy.get('#species').clear().type('Kousa Dogwoord');

      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.get('#saveAccession').click();
      cy.get('#speciesModal').should('not.exist');
      cy.wait('@getAccession');

      cy.get('#species').should('have.value', 'Kousa Dogwoord');
    });

    it('should show modal if updating the species name and modify the existant species', () => {
      cy.get('#species').clear().type('Kousa Dogwoord Modified');

      cy.get('#saveAccession').click();
      cy.get('#speciesModal').should('exist');
      cy.intercept('GET', 'api/v1/seedbank/accession/*').as('getAccession');
      cy.get('#applyAll').click();
      cy.wait('@getAccession');

      cy.get('#species').should('have.value', 'Kousa Dogwoord Modified');
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
        .should('have.attr', 'href', '/api/v1/seedbank/accession/1002/photo/accession1.jpg')
        .should('have.attr', 'target', '_blank');

      cy.get('#photo-1').contains('accession2.jpg');
      cy.get('#photo-1')
        .should('have.attr', 'href', '/api/v1/seedbank/accession/1002/photo/accession2.jpg')
        .should('have.attr', 'target', '_blank');

      // cy.request({
      //   url: Cypress.config().baseUrl + '/api/v1/seedbank/accession/1002/photo/accession1.jpg',
      //   headers: { 'X-Forwarded-User': 'dummy-auth-id' },
      // })
      //   .its('status')
      //   .should('eq', 200);
      // cy.request({
      //   url: Cypress.config().baseUrl + '/api/v1/seedbank/accession/1002/photo/accession2.jpg',
      //   headers: { 'X-Forwarded-User': 'dummy-auth-id' },
      // })
      //   .its('status')
      //   .should('eq', 200);
    });
    it('should have disabled dates', () => {
      cy.visit('/accessions/1002/seed-collection');
      cy.get('#collectedDate').should('have.class', 'Mui-disabled');
      cy.get('#receivedDate').should('have.class', 'Mui-disabled');
    });
  });

  context('Summary End Results', () => {
    it('has the right summary results', () => {
      cy.intercept('GET', '/api/v1/seedbank/summary/*').as('summary');
      cy.visit('/seeds-summary');
      cy.wait('@summary');

      cy.get('#sessions-current').contains('4');
      cy.get('#sessions-change').contains('33% since last week');
      cy.get('#sessions-arrow-increase').should('exist');

      cy.get('#species-current').contains('6');
      cy.get('#species-details').children().should('have.length', 0);

      cy.get('#families-current').contains('2');
      cy.get('#families-details').children().should('have.length', 0);

      cy.get('#update-row-Pending').contains('0 seed collection');
      cy.get('#update-row-Processed').contains('0 accessions');
      cy.get('#update-row-Dried').contains('0 accessions');
      cy.get('#update-row-Withdrawn').contains('0 accessions');
    });
  });
});
