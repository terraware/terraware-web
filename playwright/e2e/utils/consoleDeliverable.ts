import { Page } from 'playwright-core';

export async function navigateToConsoleDeliverables(page: Page) {
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('button', { name: 'Deliverables' }).click();
  await page.getByText('Phase 1 Species').click();
}

export async function approveDeliverableSpecies(name: string, page: Page) {
  await page.getByRole('button', { name }).locator('../../..').getByRole('button', { name: 'Approve' }).click();
}

export async function requestUpdateDeliverableSpecies(name: string, feedback: string, page: Page) {
  await page.getByRole('button', { name }).locator('../../..').getByRole('button', { name: 'Request Update' }).click();
  await page.getByText('Feedback').locator('..').locator('textarea').fill(feedback);
  await page.locator('#confirmReject').click();
}
