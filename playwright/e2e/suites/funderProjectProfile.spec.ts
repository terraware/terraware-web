import { test } from '@playwright/test';

import { ProjectDetails, validateProjectProfilePage } from '../utils/projectProfile';
import { addFunderCookies } from '../utils/utils';

test.setTimeout(20000);

export default function FunderProjectProfileTests() {
  test.beforeEach(async ({ context }, testInfo) => {
    // this has to be inside the tests function or else the other beforeEach will not work correctly
    await addFunderCookies(context);
  });

  test('View current project', async ({ page }, testInfo) => {
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
      additionalPageText: ['Viewing: Project Zone Figure Variable'],
    };

    await validateProjectProfilePage(projectDetails, page);
  });
}
