import type { Page } from 'playwright-core';

import { waitFor } from './utils';

export const navigateToProjectProfile = async (projectDealName: string, page: Page) => {
  await page.goto('/');
  await waitFor(page, '#acceleratorConsoleButton');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('link', { name: projectDealName }).waitFor({ state: 'visible' });
  await page.getByRole('link', { name: projectDealName }).click();
};

/**
 * Follows one of the Project Links on the profile tab. The console nav has items with the same
 * labels, so the link has to be looked up inside the tab panel.
 */
export const clickProjectProfileLink = async (label: string, page: Page) => {
  await page.getByRole('tabpanel', { name: 'Profile' }).getByRole('button', { name: label, exact: true }).click();
};

export const navigateToFundingEntities = async (page: Page) => {
  await page.goto('/');
  await waitFor(page, '#acceleratorConsoleButton');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('button', { name: 'Funding Entities' }).click();
};

export const navigateToPeople = async (page: Page) => {
  await waitFor(page, '#settings-button');
  await page.locator('#settings-button').click();
  await page.getByRole('tab', { name: 'People', exact: true }).click();
  await waitFor(page, '#people-table');
};

export const navigateHome = async (page: Page) => {
  await page.getByRole('button', { name: 'Home' }).click();
};

export const navigateConsoleToParticipant = async (page: Page) => {
  await page.getByRole('link', { name: 'Terraware' }).click();
};
