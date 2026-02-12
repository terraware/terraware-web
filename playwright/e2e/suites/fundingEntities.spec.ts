import { expect, test } from '@playwright/test';
import { Page } from 'playwright-core';

import { navigateToFundingEntities } from '../utils/navigation';
import { publishProjectProfile } from '../utils/projectProfile';
import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions } from '../utils/utils';

type Funder = {
  name: string;
  email: string;
  status: string;
};

type FundingEntity = {
  name: string;
  projects: string[];
  funders?: Funder[];
};

test.describe('FundingEntitiesTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await navigateToFundingEntities(page);
  });

  test('Add a Funding Entity', async ({ page }, testInfo) => {
    const newEntityName = `New Funding Entity-${new Date().getTime()}`;

    // unpublished projects are not in projects list
    await page.getByRole('button', { name: 'Add Funding Entity' }).click();
    await page.locator('#name > input').fill(newEntityName);
    await page.getByText('Add Project').click();
    await page.getByPlaceholder('Select...').click();
    await expect(page.locator('li').filter({ hasText: /^Phase 0 Project Deal$/ })).toBeHidden();

    await publishProjectProfile('Phase 0 Project Deal', page);
    await publishProjectProfile('Phase 1 Project Deal', page);

    await navigateToFundingEntities(page);
    await page.getByRole('button', { name: 'Add Funding Entity' }).click();
    await page.locator('#name > input').fill(newEntityName);
    await page.getByText('Add Project').click();
    await page.getByPlaceholder('Select...').click();

    await page
      .locator('li')
      .filter({ hasText: /^Phase 0 Project Deal$/ })
      .click();
    await page.getByText('Add Project').click();
    await page.getByPlaceholder('Select...').last().click();
    await page
      .locator('li')
      .filter({ hasText: /^Phase 1 Project Deal$/ })
      .click();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    const newEntity: FundingEntity = {
      name: newEntityName,
      projects: ['Phase 0 Project Deal', 'Phase 1 Project Deal'],
      funders: [],
    };

    await validateFundingEntityPage(newEntity, page);
  });

  test('Edit a Funding Entity', async ({ page }, testInfo) => {
    const updatedEntityName = `Existing Funding Entity-Updated`;

    await page.getByText('Existing Funding Entity', exactOptions).click();
    await page.getByRole('button', { name: 'Edit Funding Entity' }).click();
    await page.locator('#name > input').fill(updatedEntityName);
    await page.getByPlaceholder('Select...').locator('../../../../../..').locator('button').nth(2).click(); // remove first project
    await page.getByText('Add Project').click();
    await page.getByPlaceholder('Select...').click();
    await page
      .locator('li')
      .filter({ hasText: /^Phase 1 Project Deal$/ })
      .click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    const updatedEntity: FundingEntity = {
      name: updatedEntityName,
      projects: ['Phase 1 Project Deal'],
      funders: [
        {
          name: 'Test Funder',
          email: 'funder@terraformation.com',
          status: 'Added 2025-05-21',
        },
        {
          name: '',
          email: 'pending@terraformation.com',
          status: 'Invitation Pending',
        },
      ],
    };

    await validateFundingEntityPage(updatedEntity, page);
  });

  test('Delete a Funding Entity', async ({ page }, testInfo) => {
    await page.getByText('Funding Entity to Delete', exactOptions).click();
    await page.locator('#more-options').click();
    await page
      .locator('li')
      .filter({ hasText: /^Delete$/ })
      .click();

    await expect(page.getByText('You’re about to delete Funding Entity to Delete.')).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(1000); //Wait for funding entities list to load
    await expect(page.getByText('Funding Entity to Delete', exactOptions)).toBeHidden();
  });
});

async function validateFundingEntityPage(fundingEntity: FundingEntity, page: Page) {
  await expect(page.getByText(`Name${fundingEntity.name}`, exactOptions)).toBeVisible();

  for (const project of fundingEntity.projects) {
    await expect(page.getByRole('link', { name: project, ...exactOptions })).toBeVisible();
  }
  if (fundingEntity.funders?.length) {
    for (const funder of fundingEntity.funders) {
      // ensures that the full row is visible so that the status isn't for a different row
      await expect(
        page.getByText(funder.name).locator('../..').getByText(funder.email).locator('../..').getByText(funder.status)
      ).toBeVisible();
    }
  } else {
    await expect(page.locator('#row1')).toBeHidden();
  }
}
