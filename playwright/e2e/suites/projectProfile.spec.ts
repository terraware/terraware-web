import { expect, test } from '@playwright/test';
import type { Page } from 'playwright-core';

import { addCookies, exactOptions, waitFor } from '../utils/utils';

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

// TODO once this feature is live, delete the `user_preferences` row for `enable2025ProjectProfile` in dump.sql

type ProjectDetails = {
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
  projectLinksVisible?: string[];
  projectLinksHidden?: string[];
  sdgList?: number[];
  additionalPageText?: string[];
  hiddenText?: string[];
};

export default function ProjectProfileTests() {
  test('View Project Profile for project in application', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('button', { name: 'Applications' }).click();
    await page.getByText('Pre-screen').click();
    await page.getByPlaceholder('Search').click();
    await page.getByPlaceholder('Search').fill('Application');
    await page.locator('#row1-internalName').click();
    await page.getByText('See Project Details').click();

    const projectDetails: ProjectDetails = {
      dealName: 'COL_Terraformation (staging)',
      projectName: 'Application Project',
      topAreaCard: ['N/A', ' Eligible Area'],
      landUseModelHectares: 'Native Forest (10,000 ha)',
      totalVcu: 'N/A',
      estimatedBudget: 'N/A',
      eligibleArea: 'N/A',
      projectArea: 'N/A',
      minProjectArea: 'N/A',
      expansionPotential: 'N/A',
      nativeSpecies: '15',
      projectLinksVisible: ['Application', 'Documents', 'Deliverables', 'Reports', 'GDrive', 'Scoring'],
      projectLinksHidden: ['HubSpot', 'GIS Report', 'Verra', 'Risk Tracker', 'ClickUp', 'Slack'],
      additionalPageText: ['Passed Pre-screen', 'Viewing: Application Site Boundary', 'None selected'],
    };

    await validateProjectProfilePage(projectDetails, page);
  });

  test('View Project Profile for project in Phase 0', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 0 Project Deal', page);

    const projectDetails: ProjectDetails = {
      dealName: 'Phase 0 Project Deal',
      projectName: 'Phase 0 Project',
      overview: 'This is the phase 0 project overview.',
      country: 'Afghanistan',
      topAreaCard: ['1,000 ha', ' Eligible Area'],
      landUseModelHectares: 'Native Forest (12,100 ha)/Monoculture (13,200 ha)/Sustainable Timber (--)',
      topCarbonCard: ['100-200', 'Min-Max Carbon Accumulation'],
      totalVcu: '2,500 t',
      estimatedBudget: '$3,500 per ha',
      eligibleArea: '1,000 ha',
      projectArea: '2,000 ha',
      minProjectArea: '3,000 ha',
      expansionPotential: '1,000 ha',
      accumulationRate: '150',
      sdgList: [1, 2, 3],
      projectLinksVisible: [
        'Documents',
        'Deliverables',
        'Reports',
        'GDrive',
        'HubSpot',
        'GIS Report',
        'Verra',
        'Risk Tracker',
        'Scoring',
        'ClickUp',
        'Slack',
      ],
      projectLinksHidden: ['Application'],
      additionalPageText: ['Test Cohort Phase 0', 'Phase 0 - Due Diligence', 'Viewing: Country Only'],
      hiddenText: ['StandardVCS', 'Methodology NumberVM0033'],
    };

    await validateProjectProfilePage(projectDetails, page);
  });

  test('View Project Profile for project in Phase 1', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 1 Project Deal', page);

    const projectDetails: ProjectDetails = {
      dealName: 'Phase 1 Project Deal',
      projectName: 'Phase 1 Project',
      overview: 'This is the phase 1 project overview.',
      country: 'Argentina',
      topAreaCard: ['4,000 ha', ' Minimum Project Area'],
      landUseModelHectares: 'Other Timber (1,000 ha)/Mangroves (10,000 ha)',
      topCarbonCard: ['200', 'Accumulation Rate'],
      totalVcu: '2,400 t',
      estimatedBudget: '$12,345 per ha',
      eligibleArea: '2,000 ha',
      projectArea: '3,000 ha',
      minProjectArea: '4,000 ha',
      expansionPotential: '1,200 ha',
      nativeSpecies: '35',
      minMaxCarbonAccumulation: '110-220',
      standard: 'VCS & CCB',
      methodology: 'VM0047',
      projectLinksVisible: [
        'Documents',
        'Deliverables',
        'Reports',
        'GDrive',
        'HubSpot',
        'GIS Report',
        'Verra',
        'Risk Tracker',
        'Scoring',
        'ClickUp',
        'Slack',
      ],
      projectLinksHidden: ['Application'],
      sdgList: [4, 5, 6],
      additionalPageText: [
        'Test Cohort Phase 1',
        'Phase 1 - Feasibility Study',
        'Viewing: Project Zone Figure Variable',
      ],
    };

    await validateProjectProfilePage(projectDetails, page);
  });

  test('View and Edit Project Profile for project in Phase 2', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 2 Project Deal', page);

    const projectDetails: ProjectDetails = {
      dealName: 'Phase 2 Project Deal',
      projectName: 'Phase 2 Project',
      overview: 'This is the phase 2 project overview.',
      country: 'Guatemala',
      topAreaCard: ['31,000 ha', ' Project Area'],
      landUseModelHectares: 'Silvopasture (25,000 ha)/Other Land-Use Model (12 ha)',
      topCarbonCard: ['1500', 'Accumulation Rate'],
      totalVcu: '40 t',
      estimatedBudget: '$16 per ha',
      eligibleArea: '30,000 ha',
      projectArea: '31,000 ha',
      minProjectArea: '25,000 ha',
      expansionPotential: '6,000 ha',
      nativeSpecies: '30',
      minMaxCarbonAccumulation: '1000-2000',
      standard: 'Gold Standard',
      methodology: 'Other',
      projectLinksVisible: [
        'Documents',
        'Deliverables',
        'Reports',
        'GDrive',
        'HubSpot',
        'GIS Report',
        'Verra',
        'Risk Tracker',
        'Scoring',
        'ClickUp',
        'Slack',
      ],
      projectLinksHidden: ['Application'],
      sdgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      additionalPageText: ['Test Cohort Phase 2', 'Phase 2 - Plan and Scale', 'Viewing: Project Zone Figure Variable'],
    };

    await validateProjectProfilePage(projectDetails, page);

    const updatedProjectDetails: ProjectDetails = {
      ...projectDetails,
      dealName: projectDetails.dealName + ' Updated',
      overview: projectDetails.overview + ' Updated',
      country: 'Canada',
      landUseModelHectares: 'Monoculture (12 ha)/Silvopasture (25,000 ha)',
      eligibleArea: '30,001 ha',
      minMaxCarbonAccumulation: '1001-2002',
      standard: 'Plan Vivo',
      projectLinksVisible: projectDetails.projectLinksHidden!!.slice(0, -1), // Remove Slack
      projectLinksHidden: ['Slack', ...projectDetails.projectLinksHidden!!],
      sdgList: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    };

    await page.getByRole('button', { name: 'Edit Project', ...exactOptions }).click();

    await page.locator('#dealName').getByRole('textbox').fill(updatedProjectDetails.dealName);
    await page.getByText(projectDetails.overview!!).fill(updatedProjectDetails.overview!!);
    await page.locator('#countryCode').click();
    await page
      .locator('li')
      .filter({ hasText: /^Canada$/ })
      .click();
    await page.getByText('Other Land-Use Model').locator('..').getByLabel('remove').click();
    await page.locator('#landUseModelTypes').click();
    await page
      .locator('li')
      .filter({ hasText: /^Monoculture$/ })
      .click();
    await page.getByText('Land Use Model Type').click();
    await page.locator('#Monoculture').getByRole('spinbutton').fill('12');
    await page.locator('#confirmedReforestableLand').getByRole('spinbutton').fill('30001');
    await page.locator('#minCarbonAccumulation').getByRole('spinbutton').fill('1001');
    await page.locator('#maxCarbonAccumulation').getByRole('spinbutton').fill('2002');
    await page.locator('#standard').click();
    await page
      .locator('li')
      .filter({ hasText: /^Plan Vivo$/ })
      .click();
    await page.locator('#slackLink').getByRole('textbox').fill('');
    await page.getByText('7. Affordable and Clean Energy').locator('..').getByLabel('remove').click();

    await page.getByRole('button', { name: 'Save' }).click();

    await validateProjectProfilePage(updatedProjectDetails, page);
  });
}

async function navigateToProjectProfile(projectDealName: string, page: Page) {
  await page.goto('http://127.0.0.1:3000');
  await waitFor(page, '#home');
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await page.getByRole('link', { name: projectDealName }).click();
}

async function validateProjectProfilePage(projectDetails: ProjectDetails, page: Page) {
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

  for (const link of projectDetails.projectLinksVisible || []) {
    await expect(page.getByRole('link', { name: link, ...exactOptions })).toBeVisible();
  }

  for (const link of projectDetails.projectLinksHidden || []) {
    await expect(page.getByRole('link', { name: link, ...exactOptions })).toBeHidden();
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
}
