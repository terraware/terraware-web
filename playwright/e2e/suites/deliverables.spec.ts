import { expect, test } from '@playwright/test';

import {
  fillDeliverableInputField,
  fillDeliverableLinkField,
  fillDeliverableTextarea,
  fillTableTextField,
  selectDeliverableDropdown,
  validateDeliverableField,
  validateDeliverableOverallStatus,
  validateDeliverableStatusCard,
  validateDeliverableTableFields,
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
    await expect(page.getByText('Phase 1 Questions', exactOptions)).toBeVisible();
    await page.getByText('Phase 1 Questions').click();

    // missing required fields shows error
    await page.getByRole('button', { name: 'Submit for Approval' }).click();
    await page.getByRole('button', { name: 'Submit', ...exactOptions }).click();
    await expect(
      page.getByText('Check that all required questions are filled out before submitting', exactOptions)
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();

    // under min value shows error
    await fillDeliverableInputField('What number of native species will you plant in this project? *', '-1', page);
    await expect(page.getByText('The value is below the minimum value of 0', exactOptions)).toBeVisible();
    // over max value shows error
    await fillDeliverableInputField('What number of native species will you plant in this project? *', '1001', page);
    await expect(page.getByText('The value is above the maximum value of 1000', exactOptions)).toBeVisible();
    await fillDeliverableInputField('What number of native species will you plant in this project? *', '1000', page);

    // dependent fields
    await fillDeliverableInputField('What number of non-native species will you plant in this project?', '4', page);
    await expect(page.getByText('What is the reason these non-native species are being planted?')).toBeHidden();
    await fillDeliverableInputField('What number of non-native species will you plant in this project?', '5', page);
    await expect(page.getByText('What is the reason these non-native species are being planted?')).toBeVisible();

    await selectDeliverableDropdown(
      'What is the reason these non-native species are being planted?',
      'sustainable timber',
      page
    );
    await fillDeliverableInputField('TEST Organization Name', 'TestOrganizationName', page);
    await fillDeliverableLinkField(
      'What sources have been consulted to create your species list?',
      'https://example.com',
      'Link Title',
      page
    );

    await selectDeliverableDropdown(
      'Does the land at the project site require preparation before the planting begins?',
      'do',
      page
    );
    await fillDeliverableTextarea(
      'If so, please write out the steps and time needed to complete the land preparation',
      "Because I'm testing stuff",
      page
    );
    await fillTableTextField(
      'invasive and problematic species that would need to be removed',
      0,
      'TestLocalName',
      page
    );
    await fillTableTextField(
      'invasive and problematic species that would need to be removed',
      2,
      'TestScientificName',
      page
    );
    await fillTableTextField(
      'invasive and problematic species that would need to be removed',
      4,
      'TestOtherFacts',
      page
    );
    await fillDeliverableInputField('What is the start date of the Project?', today.toISOString().split('T')[0], page);
    await page.getByRole('button', { name: 'Save' }).click();

    await validateDeliverableField('What number of native species will you plant in this project?', '1000', page);
    await validateDeliverableField('What number of non-native species will you plant in this project?', '5', page);
    await validateDeliverableField(
      'What is the reason these non-native species are being planted?',
      'sustainable timber',
      page
    );
    await validateDeliverableField('TEST Organization Name', 'TestOrganizationName', page);
    await validateDeliverableField('What sources have been consulted to create your species list?', 'Link Title', page);
    await validateDeliverableField(
      'Does the land at the project site require preparation before the planting begins?',
      'do',
      page
    );
    await validateDeliverableField(
      'If so, please write out the steps and time needed to complete the land preparation',
      "Because I'm testing stuff",
      page
    );
    await validateDeliverableTableFields(
      'What are the invasive and problematic species that would need to be removed during land preparation?',
      ['TestLocalName', 'TestScientificName', 'TestOtherFacts'],
      page
    );
    await validateDeliverableField('What is the start date of the Project?', '2025-07-10', page);

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
      await validateDeliverableStatusCard(label, 'In Review', page);
    }

    await validateDeliverableOverallStatus('Test Questionnaire for Phase 1', 'Not Submitted', page);
    await page.getByRole('button', { name: 'Submit for Approval' }).click();
    await page.getByRole('button', { name: 'Submit', ...exactOptions }).click();
    await validateDeliverableOverallStatus('Test Questionnaire for Phase 1', 'In Review', page);
  });

  // test('Document Deliverable', async ({ page }) => {});

  // test('Species Deliverable', async ({ page }) => {});
}
