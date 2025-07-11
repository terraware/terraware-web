import { expect, test } from '@playwright/test';

import {
  approveDeliverableSpecies,
  navigateToConsoleDeliverables,
  requestUpdateDeliverableSpecies,
} from '../utils/consoleDeliverable';
import {
  deleteDeliverableSpecies,
  fillQuestionnaireInputField,
  fillQuestionnaireLinkField,
  fillQuestionnaireTableTextField,
  fillQuestionnaireTextarea,
  fillSpeciesModalRationale,
  navigateToParticipantDeliverables,
  saveSpeciesModal,
  selectQuestionnaireDropdown,
  selectSpeciesModalDropdown,
  validateQuestionnaireField,
  validateQuestionnaireOverallStatus,
  validateQuestionnaireStatusCard,
  validateQuestionnaireTableFields,
  validateSpeciesStatus,
} from '../utils/participantDeliverable';
import { addCookies, exactOptions, waitFor } from '../utils/utils';

test.beforeEach(async ({ context }) => {
  await addCookies(context);
});

export default function DeliverableTests() {
  test('Deliverables tab shows up once cohort has module with deliverables', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    await expect(page.getByText('Deliverables', exactOptions)).toBeHidden();
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('tab', { name: 'Cohorts' }).click();
    await page.getByRole('link', { name: 'Test Cohort Phase 1' }).click();
    await page.getByRole('button', { name: 'Edit Cohort' }).click();
    await page.getByRole('button', { name: 'Add Module' }).click();
    await page.locator('#title').locator('input').fill('Test Module 1');
    await page.getByText('Module *').locator('..').locator('input').click();
    await page
      .locator('li')
      .filter({ hasText: /^\(1000\) Test Phase 1 Module$/ })
      .click();
    await page.getByText('Start Date *').locator('..').locator('input').fill(today.toISOString().split('T')[0]);
    await page.getByText('End Date *').locator('..').locator('input').fill(tomorrow.toISOString().split('T')[0]);
    await page.locator('.dialog-box--footer').getByText('Save').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Changes Saved!')).toBeVisible();

    await page.getByRole('link', { name: 'Terraware' }).click();
    await expect(page.getByText('Deliverables', exactOptions)).toBeVisible();
  });

  test('Questionnaire Deliverable', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    const today = new Date();

    await page.getByText('Deliverables', exactOptions).click();
    await expect(page.getByText('Phase 1 Questions', exactOptions)).toBeVisible(); // waits for table to load
    await page.getByText('Phase 1 Questions').click();

    // missing required fields shows error
    await expect(page.getByText('What number of native species will you plant in this project?')).toBeVisible();
    await page.getByRole('button', { name: 'Submit for Approval' }).click();
    await page.getByRole('button', { name: 'Submit', ...exactOptions }).click();
    await expect(
      page.getByText('Check that all required questions are filled out before submitting', exactOptions)
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();

    // under min value shows error
    await fillQuestionnaireInputField('What number of native species will you plant in this project? *', '-1', page);
    await expect(page.getByText('The value is below the minimum value of 0', exactOptions)).toBeVisible();
    // over max value shows error
    await fillQuestionnaireInputField('What number of native species will you plant in this project? *', '1001', page);
    await expect(page.getByText('The value is above the maximum value of 1000', exactOptions)).toBeVisible();
    await fillQuestionnaireInputField('What number of native species will you plant in this project? *', '1000', page);

    // dependent fields
    await fillQuestionnaireInputField('What number of non-native species will you plant in this project?', '4', page);
    await expect(page.getByText('What is the reason these non-native species are being planted?')).toBeHidden();
    await fillQuestionnaireInputField('What number of non-native species will you plant in this project?', '5', page);
    await expect(page.getByText('What is the reason these non-native species are being planted?')).toBeVisible();

    await selectQuestionnaireDropdown(
      'What is the reason these non-native species are being planted?',
      'sustainable timber',
      page
    );
    await fillQuestionnaireInputField('TEST Organization Name', 'TestOrganizationName', page);
    await fillQuestionnaireLinkField(
      'What sources have been consulted to create your species list?',
      'https://example.com',
      'Link Title',
      page
    );

    await selectQuestionnaireDropdown(
      'Does the land at the project site require preparation before the planting begins?',
      'do',
      page
    );
    await fillQuestionnaireTextarea(
      'If so, please write out the steps and time needed to complete the land preparation',
      "Because I'm testing stuff",
      page
    );
    await fillQuestionnaireTableTextField(
      'invasive and problematic species that would need to be removed',
      0,
      'TestLocalName',
      page
    );
    await fillQuestionnaireTableTextField(
      'invasive and problematic species that would need to be removed',
      2,
      'TestScientificName',
      page
    );
    await fillQuestionnaireTableTextField(
      'invasive and problematic species that would need to be removed',
      4,
      'TestOtherFacts',
      page
    );
    await fillQuestionnaireInputField(
      'What is the start date of the Project?',
      today.toISOString().split('T')[0],
      page
    );
    await page.getByRole('button', { name: 'Save' }).click();

    await validateQuestionnaireField('What number of native species will you plant in this project?', '1000', page);
    await validateQuestionnaireField('What number of non-native species will you plant in this project?', '5', page);
    await validateQuestionnaireField(
      'What is the reason these non-native species are being planted?',
      'sustainable timber',
      page
    );
    await validateQuestionnaireField('TEST Organization Name', 'TestOrganizationName', page);
    await validateQuestionnaireField(
      'What sources have been consulted to create your species list?',
      'Link Title',
      page
    );
    await validateQuestionnaireField(
      'Does the land at the project site require preparation before the planting begins?',
      'do',
      page
    );
    await validateQuestionnaireField(
      'If so, please write out the steps and time needed to complete the land preparation',
      "Because I'm testing stuff",
      page
    );
    await validateQuestionnaireTableFields(
      'What are the invasive and problematic species that would need to be removed during land preparation?',
      ['TestLocalName', 'TestScientificName', 'TestOtherFacts'],
      page
    );
    await validateQuestionnaireField('What is the start date of the Project?', '2025-07-10', page);

    const inReviewVariables = [
      'What number of native species will you plant in this project?',
      'What number of non-native species will you plant in this project?',
      'What is the reason these non-native species are being planted?',
      'TEST Organization Name',
      'What sources have been consulted to create your species list?',
      'Does the land at the project site require preparation before the planting begins?',
      'If so, please write out the steps and time needed to complete the land preparation',
      'What are the invasive and problematic species that would need to be removed during land preparation?',
      'What is the start date of the Project?',
    ];
    for (const label of inReviewVariables) {
      await validateQuestionnaireStatusCard(label, 'In Review', page);
    }

    await validateQuestionnaireOverallStatus('Test Questionnaire for Phase 1', 'Not Submitted', page);
    await page.getByRole('button', { name: 'Submit for Approval' }).click();
    await page.getByRole('button', { name: 'Submit', ...exactOptions }).click();
    await validateQuestionnaireOverallStatus('Test Questionnaire for Phase 1', 'In Review', page);
  });

  test.skip('Document Deliverable', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    await page.getByText('Deliverables', exactOptions).click();
    await expect(page.getByText('Phase 1 Document', exactOptions)).toBeVisible(); // waits for table to load
    await page.getByText('Phase 1 Document').click();

    await page.setInputFiles('input', 'photo-data/test/Highlight.png');
    await page.getByText('Description *').locator('..').locator('input').fill('TestDescription');
    await page.getByRole('button', { name: 'Submit' }).click();

    // todo finish this test once we have support for local file storage
  });

  test.only('Species Deliverable', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    await page.getByText('Deliverables', exactOptions).click();
    await expect(page.getByText('Phase 1 Species', exactOptions)).toBeVisible(); // waits for table to load
    await page.getByText('Phase 1 Species').click();

    await expect(page.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
    await expect(page.getByText('There are no species added to this Project yet.')).toBeVisible();

    await page.getByRole('button', { name: 'Add Species to Project' }).click();
    await saveSpeciesModal(page);
    await expect(page.locator('.textfield-label-container')).toHaveCount(3);

    await selectSpeciesModalDropdown('Scientific Name', 'Banana', page);
    await selectSpeciesModalDropdown('Native/Non-Native', 'Native', page);
    await fillSpeciesModalRationale('This is my rationale.', page);
    await saveSpeciesModal(page);

    await page.getByRole('button', { name: 'Add Species to Project' }).click();
    await selectSpeciesModalDropdown('Scientific Name', 'Coconut', page);
    await selectSpeciesModalDropdown('Native/Non-Native', 'Non-Native', page);
    await fillSpeciesModalRationale('This one will be deleted real soon.', page);
    await saveSpeciesModal(page);

    await page.getByRole('button', { name: 'Add Species to Project' }).click();
    await selectSpeciesModalDropdown('Scientific Name', 'Kousa Dogwood', page);
    await selectSpeciesModalDropdown('Native/Non-Native', 'Non-Native', page);
    await fillSpeciesModalRationale('This is my other rationale.', page);
    await saveSpeciesModal(page);

    await deleteDeliverableSpecies('Coconut', page);

    await expect(page.getByText('1 to 2')).toBeVisible();

    await page.getByRole('button', { name: 'Submit for Approval' }).click();
    await page.getByRole('button', { name: 'Submit', ...exactOptions }).click();
    await expect(page.getByText('Deliverable Submitted')).toBeVisible();

    await expect(page.getByText('In Review')).toBeVisible();
    await validateSpeciesStatus('Banana', 'Not Submitted', page);
    await validateSpeciesStatus('Kousa Dogwood', 'Not Submitted', page);

    await navigateToConsoleDeliverables(page);
    await approveDeliverableSpecies('Kousa Dogwood', page);
    await requestUpdateDeliverableSpecies('Banana', 'You did something wrong', page);

    await navigateToParticipantDeliverables(page);
    await page.getByText('Phase 1 Species').click();
    await expect(page.getByText('Banana: You did something wrong')).toBeVisible();
    await validateSpeciesStatus('Banana', 'Update Needed', page);
    await validateSpeciesStatus('Kousa Dogwood', 'Approved', page);
  });
}
