import { expect } from '@playwright/test';
import { Page } from 'playwright-core';

export async function navigateToConsoleDeliverables(page: Page) {
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('button', { name: 'Deliverables' }).click();
}

export async function approveDeliverableSpecies(name: string, page: Page) {
  await page.getByRole('button', { name }).locator('../../..').getByRole('button', { name: 'Approve' }).click();
}

export async function requestUpdateDeliverableSpecies(name: string, feedback: string, page: Page) {
  await page.getByRole('button', { name }).locator('../../..').getByRole('button', { name: 'Request Update' }).click();
  await page.getByText('Feedback').locator('..').locator('textarea').fill(feedback);
  await page.locator('#confirmReject').click();
}

export async function requestUpdateQuestionnaire(feedback: string, page: Page) {
  await page.locator('#rejectDeliverable').click();
  await page.getByText('Feedback').locator('..').locator('textarea').fill(feedback);
  await page.locator('#confirmReject').click();
}

export async function addQuestionnaireComments(question: string, comments: string, page: Page) {
  await page.getByText(question).hover();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByText('Internal Comments').locator('..').locator('textarea').fill(comments);
  await page.locator('#save').click();
  await validateQuestionnaireComments(question, comments, page);
}

export async function validateQuestionnaireComments(question: string, comments: string, page: Page) {
  await expect(page.getByText(question).locator('../../..').getByText(comments)).toBeVisible();
}

export async function approveQuestionInQuestionnaire(question: string, page: Page) {
  await page.getByText(question).hover();
  await page.getByText(question).locator('../..').getByRole('button', { name: 'Approve' }).click();
  await validateConsoleQuestionnaireStatusCard(question, 'Approved', page);
}

export async function requestQuestionUpdatesQuestionnaire(question: string, feedback: string, page: Page) {
  await page.getByText(question).hover();
  await page.getByText(question).locator('../..').getByRole('button', { name: 'Request Update' }).click();
  await page.getByText('Feedback').locator('..').locator('textarea').fill(feedback);
  await page.locator('#confirmReject').click();
  await expect(page.getByText('Feedback (shared with project)').locator('..').getByText(feedback)).toBeVisible();
  await validateConsoleQuestionnaireStatusCard(question, 'Update Requested', page);
}

export async function validateQuestionnaireUpdateComments(comments: string, page: Page) {
  await expect(page.getByText('Deliverable Update Needed').locator('../..').getByText(comments)).toBeVisible();
}

export async function validateQuestionnaireQuestionUpdateComments(question: string, comments: string, page: Page) {
  await expect(
    page.getByText("One or more answers needed updates. View them below to see each answer's feedback.")
  ).toBeVisible();
  await expect(page.getByText(question).locator('..').getByText('Update Needed')).toBeVisible();
  await expect(page.getByText(question).locator('..').getByText(comments)).toBeVisible();
}

export async function approveQuestionnaireDeliverable(page: Page) {
  await page.getByRole('button', { name: 'Approve' }).click({ timeout: 1000 });
  await page.locator('#confirmApprove').click();
}

export async function validateConsoleQuestionnaireStatusCard(question: string, status: string, page: Page) {
  await expect(page.getByText(question).locator('../..').getByText(status)).toBeVisible();
}
