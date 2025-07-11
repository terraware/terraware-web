import { expect, test } from '@playwright/test';

import { navigateToProjectProfile } from '../utils/navigation';
import { ProjectDetails, validateProjectProfilePage } from '../utils/projectProfile';
import { changeToFunderUser, changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, waitFor } from '../utils/utils';

test.setTimeout(20000);

export default function FunderProjectProfileTests() {
  test('Publish Project and then View Published Project', async ({ page, context }, testInfo) => {
    // publish project
    await changeToSuperAdmin(context);
    await navigateToProjectProfile('Phase 1 Project Deal', page);
    await page.locator('#more-options').click();
    await page
      .locator('li')
      .filter({ hasText: /^Publish$/ })
      .click();
    await expect(page.getByText('You are about to publish to the Funder Portal.')).toBeVisible();
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Project Profile Published', exactOptions)).toBeVisible();

    // view published project
    await changeToFunderUser(context);
    await page.goto('http://127.0.0.1:3000');
    await page.getByRole('tab', { name: 'Project Profile' }).click();

    const projectDetails: ProjectDetails = {
      dealName: 'Phase 1 Project Deal',
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
      standard: 'VCS & CCB',
      methodology: 'VM0047',
      projectLinksVisible: ['Verra'],
      projectLinksHidden: [
        'Documents',
        'Deliverables',
        'Scoring',
        'Reports',
        'GDrive',
        'HubSpot',
        'GIS Report',
        'Application',
        'Risk Tracker',
        'ClickUp',
        'Slack',
      ],
      sdgList: [4, 5, 6],
      hiddenText: ['Viewing: Project Zone Figure Variable'],
    };

    await validateProjectProfilePage(projectDetails, page);
  });
}
