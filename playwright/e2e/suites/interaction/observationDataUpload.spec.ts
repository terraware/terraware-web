import { expect, test } from '@playwright/test';

import {
  findObservablePlantingSite,
  getFirstKnownSpeciesId,
  scheduleObservation,
  startObservation,
  uploadObservationData,
} from '../../utils/observationUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { selectOrg, waitFor } from '../../utils/utils';

test.describe('ObservationDataUploadTests', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test('Create and start an observation, upload plot data, and verify the results', async ({ page }) => {
    // 1. Create an observation and start it
    const { plantingSiteId, plantingSiteName, substratumIds } = await findObservablePlantingSite(page.request);
    const speciesId = await getFirstKnownSpeciesId(page.request);
    const observationId = await scheduleObservation(page.request, { plantingSiteId, substratumIds });
    await startObservation(page.request, { observationId, plantingSiteId });

    // 2. Upload observation data
    const completedPlots = await uploadObservationData(page.request, {
      observationId,
      speciesId,
      livePlants: 13,
      deadPlants: 4,
      conditions: ['FavorableWeather'],
      notes: 'Automated observation upload test',
    });
    const plot = completedPlots[0];
    const conditionsLabel = 'Favorable Weather';

    // 3. The observation appears on the Observations page.
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();
    await page.getByRole('textbox').first().click();
    await page.locator('li.select-value', { hasText: 'All Planting Sites' }).click();

    const observationLink = page.locator(`a[href="/observations/${observationId}"]`);
    await expect(observationLink.first()).toBeVisible({ timeout: 30000 });

    // 4. Open the observation to verify the uploaded data.
    await observationLink.first().click();
    await waitFor(page, '#home');
    await expect(page.getByText(plantingSiteName, { exact: false }).first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#observationSpeciesTotalChart')).toBeVisible({ timeout: 30000 });
    await page.getByRole('link', { name: plot.stratumName, exact: true }).first().click();
    const plotLink = page.getByRole('link', { name: String(plot.plotNumber), exact: true });
    await expect(plotLink.first()).toBeVisible({ timeout: 30000 });
    await plotLink.first().click();
    await expect(page.getByText('Plot Info')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#plotSpeciesTotalChart')).toBeVisible({ timeout: 30000 });
    const main = page.getByRole('main');
    const metricValue = (label: string) =>
      main.getByText(label, { exact: true }).first().locator('xpath=../following-sibling::div[1]');
    await expect(metricValue('Total Plants')).toHaveText(String(plot.totalPlants));
    await expect(metricValue('Live Plants')).toHaveText(String(plot.livePlants));
    await expect(metricValue('Dead Plants')).toHaveText(String(plot.deadPlants));
    await expect(metricValue('Species')).toHaveText(String(plot.totalSpecies));
    const displayValue = (label: string) =>
      page.locator(`label.textfield-label:has-text("${label}") + p.textfield-value--display`);
    await expect(displayValue('Plot Conditions')).toHaveText(conditionsLabel);
    await expect(displayValue('Field Notes')).toHaveText(plot.notes);
  });
});
