import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { selectOrg, waitFor } from '../utils/utils';

test.describe('ObservationsTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Schedule Observation', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    await page.getByRole('button', { name: 'Schedule Observation' }).click();
    await expect(page.getByText('Schedule Observation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

    // select planting site & strata
    await page.locator('#site').click();
    await page.locator('li.select-value').first().click();
    await page.getByLabel('Select All').click();

    // enter observation start date (today)
    await page.getByLabel('Observation Start Date').fill(new Date().toISOString().split('T')[0]);

    // enter observation end date (today + 30 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateFormatted = futureDate.toISOString().split('T')[0];
    await page.getByLabel('Observation End Date').fill(futureDateFormatted);

    // save
    await page.getByRole('button', { name: 'Save' }).click();

    // wait for success toast message
    await waitFor(page, '#snackbar p:has-text("Observation scheduled!")');
  });

  test('Reschedule Observation', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');

    // open action menu
    await page
      .locator('tr')
      .filter({ hasText: 'Overdue' })
      .first()
      .getByLabel('More Options')
      .getByRole('button')
      .click();

    // click reschedule
    await page.getByRole('menuitem', { name: 'Reschedule' }).click();

    await expect(page.getByText('Reschedule Observation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

    // update observation start date (today)
    await page.getByLabel('Observation Start Date').fill(new Date().toISOString().split('T')[0]);

    // enter observation end date (today + 30 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateFormatted = futureDate.toISOString().split('T')[0];
    await page.getByLabel('Observation End Date').fill(futureDateFormatted);

    // save
    await page.getByRole('button', { name: 'Save' }).click();

    // wait for success toast message
    await waitFor(page, '#snackbar p:has-text("Observation rescheduled!")');
  });

  test('End Observation', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');

    // open action menu
    await page
      .locator('tr')
      .filter({ hasText: 'Overdue' })
      .first()
      .getByLabel('More Options')
      .getByRole('button')
      .click();

    // click reschedule
    await page.getByRole('menuitem', { name: 'End Observation' }).click();

    // wait for save button to load
    await waitFor(page, '#save');

    // save
    await page.locator('#save').click();

    // wait for success toast message
    await waitFor(page, '#snackbar p:has-text("observation has been ended")');
  });
});
