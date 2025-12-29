import { test } from '@playwright/test';

import { TERRAWARE_WEB_URL } from '../constants';
import { ProjectDetails, publishProjectProfile, validateProjectProfilePage } from '../utils/projectProfile';
import { changeToFunderUser, changeToSuperAdmin } from '../utils/userUtils';

test.describe('FunderProjectProfileTests', () => {
  test('Publish Project and then View Published Project', async ({ page, context }, testInfo) => {
    // publish project
    await changeToSuperAdmin(context);
    await publishProjectProfile('Phase 1 Project Deal', page);

    // view published project
    await changeToFunderUser(context);
    await page.goto(TERRAWARE_WEB_URL);
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
});
