import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';

import { exactOptions } from './utils';

export async function fillDeliverableInputField(label: string, fillText: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('input').fill(fillText);
}

export async function fillDeliverableTextarea(label: string, fillText: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('textarea').fill(fillText);
}

export async function selectDeliverableDropdown(label: string, dropdownOption: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('svg').click();
  await page.locator('li').filter({ hasText: dropdownOption }).nth(0).click();
}

export async function fillDeliverableLinkField(label: string, link: string, title: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('input').nth(0).fill(link);
  await page.getByText(label).locator('../../../..').locator('input').nth(1).fill(title);
}

export async function fillTableTextField(tableLabel: string, columnIndex: number, fillText: string, page: Page) {
  await page.getByText(tableLabel).locator('../../../..').locator('input').nth(columnIndex).fill(fillText);
}

export async function validateDeliverableStatusCard(label: string, status: string, page: Page) {
  await expect(page.getByText(label).locator('..').locator('span').getByText(status)).toBeVisible();
}

export async function validateDeliverableField(label: string, expectedText: string, page: Page) {
  await expect(page.getByText(label).locator('..').locator('span').getByText(expectedText, exactOptions)).toBeVisible();
}

export async function validateDeliverableTableFields(tableLabel: string, expectedTexts: string[], page: Page) {
  for (const expectedText of expectedTexts) {
    await expect(
      page.getByText(tableLabel).locator('..').locator('p').getByText(expectedText, exactOptions)
    ).toBeVisible();
  }
}

export async function validateDeliverableOverallStatus(description: string, status: string, page: Page) {
  await expect(page.getByText(description).locator('..').locator('span').getByText(status, exactOptions)).toBeVisible();
}
