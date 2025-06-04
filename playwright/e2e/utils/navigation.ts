import type { Page } from 'playwright-core';

import { waitFor } from './utils';

export const navigateToProjectProfile = async (projectDealName: string, page: Page) => {
  await page.goto('http://127.0.0.1:3000');
  await waitFor(page, '#home');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: projectDealName }).click();
};

export const navigateToFundingEntities = async (page: Page) => {
  await page.goto('http://127.0.0.1:3000');
  await waitFor(page, '#home');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('button', { name: 'Funding Entities' }).click();
};
