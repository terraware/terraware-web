import { expect, test } from '@playwright/test';

import {
  findObservablePlantingSite,
  getFirstKnownSpeciesId,
  uploadAdHocObservationData,
} from '../../utils/observationUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { selectOrg, waitFor } from '../../utils/utils';

test.describe('AdHocObservationDataUploadTests', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test('Upload an ad-hoc observation and verify the results', async ({ page }) => {
    // 1. Create and complete an ad-hoc observation
    const { plantingSiteId } = await findObservablePlantingSite(page.request);
    const speciesId = await getFirstKnownSpeciesId(page.request);
    const observation = await uploadAdHocObservationData(page.request, {
      plantingSiteId,
      speciesId,
      livePlants: 13,
      deadPlants: 4,
      conditions: ['FavorableWeather'],
      notes: 'Automated ad-hoc observation upload test',
    });
    const conditionsLabel = 'Favorable Weather';

    // 2. The ad-hoc observation appears on the Observations page
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();
    await page.getByRole('textbox').first().click();
    await page.locator('li.select-value', { hasText: 'All Planting Sites' }).click();
    await page.locator('#plot-selection-selector').click();
    await page.locator('li.select-value', { hasText: 'Ad Hoc' }).click();
    const observationLink = page.locator(`a[href="/observations/${observation.observationId}"]`);
    await expect(observationLink.first()).toBeVisible({ timeout: 30000 });

    // 3. Open the ad-hoc observation and verify the data.
    await observationLink.first().click();
    await expect(page.getByText('Plot Info')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#plotSpeciesTotalChart')).toBeVisible({ timeout: 30000 });
    const main = page.getByRole('main');
    const metricValue = (label: string) =>
      main.getByText(label, { exact: true }).first().locator('xpath=../following-sibling::div[1]');
    await expect(metricValue('Total Plants')).toHaveText(String(observation.totalPlants));
    await expect(metricValue('Live Plants')).toHaveText(String(observation.livePlants));
    await expect(metricValue('Dead Plants')).toHaveText(String(observation.deadPlants));
    await expect(metricValue('Species')).toHaveText(String(observation.totalSpecies));
    const displayValue = (label: string) =>
      page.locator(`label.textfield-label:has-text("${label}") + p.textfield-value--display`);
    await expect(displayValue('Plot Conditions')).toHaveText(conditionsLabel);
    await expect(displayValue('Field Notes')).toHaveText(observation.notes);
  });
});
