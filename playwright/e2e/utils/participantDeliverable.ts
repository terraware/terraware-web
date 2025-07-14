import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';

import { exactOptions } from './utils';

export async function verifyHomepageDeliverableStatus(
  deliverableName: string,
  status: string,
  inTodoList: boolean,
  todoStatus: string,
  page: Page
) {
  if (todoStatus !== '') {
    const todoItem = page
      .locator('p', { hasText: deliverableName })
      .locator('../..')
      .locator('p')
      .filter({ hasText: todoStatus });
    if (inTodoList) {
      await expect(todoItem).toBeVisible();
    } else {
      await expect(todoItem).toBeHidden();
    }
  }
  await expect(
    page.getByRole('button', { name: deliverableName }).locator('../..').locator('p').filter({ hasText: status })
  ).toBeVisible();
}

export async function navigateToParticipantDeliverables(page: Page) {
  if (await page.getByRole('link', { name: 'Terraware' }).isVisible()) {
    await page.getByRole('link', { name: 'Terraware' }).click();
  }
  await page.getByText('Deliverables', exactOptions).click();
}

export async function fillQuestionnaireInputField(label: string, fillText: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('input').fill(fillText);
}

export async function fillQuestionnaireTextarea(label: string, fillText: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('textarea').fill(fillText);
}

export async function selectQuestionnaireDropdown(label: string, dropdownOption: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('svg').click();
  await page.locator('li').filter({ hasText: dropdownOption }).nth(0).click();
}

export async function fillQuestionnaireLinkField(label: string, link: string, title: string, page: Page) {
  await page.getByText(label).locator('../../../..').locator('input').nth(0).fill(link);
  await page.getByText(label).locator('../../../..').locator('input').nth(1).fill(title);
}

export async function fillQuestionnaireTableTextField(
  tableLabel: string,
  columnIndex: number,
  fillText: string,
  page: Page
) {
  await page.getByText(tableLabel).locator('../../../..').locator('input').nth(columnIndex).fill(fillText);
}

export async function validateQuestionnaireStatusCard(label: string, status: string, page: Page) {
  await expect(page.getByText(label).locator('..').locator('span').getByText(status)).toBeVisible();
}

export async function validateQuestionnaireField(label: string, expectedText: string, page: Page) {
  await expect(page.getByText(label).locator('..').locator('span').getByText(expectedText, exactOptions)).toBeVisible();
}

export async function validateQuestionnaireTableFields(tableLabel: string, expectedTexts: string[], page: Page) {
  for (const expectedText of expectedTexts) {
    await expect(
      page.getByText(tableLabel).locator('..').locator('p').getByText(expectedText, exactOptions)
    ).toBeVisible();
  }
}

export async function validateQuestionnaireOverallStatus(description: string, status: string, page: Page) {
  await expect(page.getByText(description).locator('..').locator('span').getByText(status, exactOptions)).toBeVisible();
}

export async function selectSpeciesModalDropdown(label: string, dropdownOption: string, page: Page) {
  await page.getByText(label).locator('..').locator('svg').nth(0).click();
  await page.locator('li').filter({ hasText: dropdownOption }).nth(0).click();
}

export async function fillSpeciesModalRationale(text: string, page: Page) {
  await page.getByText('Rationale').locator('..').locator('textarea').fill(text);
}

export async function saveSpeciesModal(page: Page) {
  await page.getByRole('button', { name: 'Add to Project' }).click();
}

export async function deleteDeliverableSpecies(name: string, page: Page) {
  await page.getByText(name).locator('../../..').locator('input').nth(0).check();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByText('Are you sure').locator('../..').getByRole('button', { name: 'Remove' }).click();
}

export async function validateSpeciesStatus(name: string, status: string, page: Page) {
  await expect(page.getByRole('button', { name }).locator('../../..').getByText(status)).toBeVisible();
}
