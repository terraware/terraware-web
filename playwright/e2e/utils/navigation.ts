import type { Page } from 'playwright-core';

import { waitFor } from './utils';

export const navigateToProjectProfile = async (projectDealName: string, page: Page) => {
  await page.goto('/');
  await waitFor(page, '#acceleratorConsoleButton');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: projectDealName }).click();
};

export const navigateToFundingEntities = async (page: Page) => {
  await page.goto('/');
  await waitFor(page, '#acceleratorConsoleButton');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('button', { name: 'Funding Entities' }).click();
};

export const navigateHome = async (page: Page) => {
  await page.getByRole('button', { name: 'Home' }).click();
};

export const navigateConsoleToParticipant = async (page: Page) => {
  await page.getByRole('link', { name: 'Terraware' }).click();
};
