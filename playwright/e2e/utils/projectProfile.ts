import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';

import { navigateToProjectProfile } from './navigation';
import { exactOptions } from './utils';

export type ProjectDetails = {
  dealName: string;
  projectName?: string;
  overview?: string;
  country?: string;
  topAreaCard?: [string, string];
  landUseModelHectares?: string;
  topCarbonCard?: [string, string];
  totalVcu?: string;
  estimatedBudget?: string;
  eligibleArea?: string;
  projectArea?: string;
  minProjectArea?: string;
  nativeSpecies?: string;
  expansionPotential?: string;
  accumulationRate?: string;
  minMaxCarbonAccumulation?: string;
  methodology?: string;
  standard?: string;
  carbonCertifications?: string[];
  projectLinksVisible?: string[];
  projectLinksHidden?: string[];
  sdgList?: number[];
  additionalPageText?: string[];
  hiddenText?: string[];
  fundingEntities?: string[];
};

export async function validateProjectProfilePage(projectDetails: ProjectDetails, page: Page) {
  const validateExactText = async (text?: string) =>
    text && (await expect(page.getByText(text, exactOptions)).toBeVisible());
  const validateWithPre = async (preText: string, text?: string) => text && validateExactText(preText + text);
  const validateWithPost = async (postText: string, text?: string) => text && validateExactText(text + postText);

  await validateExactText(projectDetails.dealName);
  await validateExactText(projectDetails.overview);
  await validateWithPre('Name Used by Project: ', projectDetails.projectName);
  await validateWithPost(' Country', projectDetails.country);
  projectDetails.topAreaCard && (await validateWithPost(...projectDetails.topAreaCard));
  await validateWithPost(' Land Use Model Type', projectDetails.landUseModelHectares);
  projectDetails.topCarbonCard &&
    (await validateWithPost(` tCO2/ha/yr${projectDetails.topCarbonCard[1]}`, projectDetails.topCarbonCard[0]));
  projectDetails.totalVcu &&
    expect(await page.getByText('Total VCUs (40 yrs)').locator('..').allInnerTexts()).toContain(
      `${projectDetails.totalVcu}\n\nTotal VCUs (40 yrs)`
    );
  await validateWithPost(' Estimated Budget', projectDetails.estimatedBudget);
  await validateWithPre('Native Species to be Planted', projectDetails.nativeSpecies);
  await validateWithPre('Eligible Area', projectDetails.eligibleArea);
  await validateWithPre('Project Area', projectDetails.projectArea);
  await validateWithPre('Minimum Project Area', projectDetails.minProjectArea);
  await validateWithPre('Expansion Potential', projectDetails.expansionPotential);
  projectDetails.accumulationRate &&
    (await validateWithPre('Accumulation Rate', `${projectDetails.accumulationRate} tCO2/ha/yr`));
  projectDetails.minMaxCarbonAccumulation &&
    (await validateWithPre('Min-Max Carbon Accumulation', `${projectDetails.minMaxCarbonAccumulation} tCO2/ha/yr`));
  await validateWithPre('Standard', projectDetails.standard);
  await validateWithPre('Methodology Number', projectDetails.methodology);

  for (const altText of projectDetails.carbonCertifications || []) {
    await expect(page.getByAltText(altText, exactOptions)).toBeVisible();
  }

  for (const link of projectDetails.projectLinksVisible || []) {
    await expect(
      page
        .getByText('Project Links')
        .locator('..')
        .getByRole('button', { name: link, ...exactOptions })
    ).toBeVisible();
  }

  for (const link of projectDetails.projectLinksHidden || []) {
    await expect(
      page
        .getByText('Project Links')
        .locator('..')
        .getByRole('button', { name: link, ...exactOptions })
    ).toBeHidden();
  }

  if (projectDetails.sdgList) {
    for (const sdg of projectDetails.sdgList) {
      await expect(page.getByAltText(`SDG ${sdg}`, exactOptions)).toBeVisible();
    }
  }

  for (const text of projectDetails.additionalPageText || []) {
    await validateExactText(text);
  }

  for (const text of projectDetails.hiddenText || []) {
    await expect(page.getByText(text, exactOptions)).toBeHidden();
  }

  for (const entity of projectDetails.fundingEntities || []) {
    await expect(page.getByText('Funding Entities').locator('../..').getByText(entity)).toBeVisible();
  }
}

export async function publishProjectProfile(dealName: string, page: Page) {
  await navigateToProjectProfile(dealName, page);
  await page.locator('#more-options').click();
  await page
    .locator('li')
    .filter({ hasText: /^Publish$/ })
    .click();
  await expect(page.getByText('You are about to publish to the Funder Portal.')).toBeVisible();
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText('Project Profile Published', exactOptions)).toBeVisible();
}
