import { expect, test } from '@playwright/test';

import {
  BOUNDARY_FIXTURE,
  clickMap,
  descriptionField,
  detailField,
  drawPolygon,
  editorButton,
  enableSiteEditorPreferences,
  expectActiveStep,
  goToPlantingSites,
  openDraftPlantingSite,
  searchMapLocation,
  selectSiteType,
  startNewPlantingSite,
  waitForMap,
  zoomMapIn,
} from '../../utils/plantingSiteUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { selectOrg, waitFor } from '../../utils/utils';

const SITE_ADDRESS = '1600 Pennsylvania Avenue NW, Washington, DC';
// Search results open at zoom 10; zoom 14 makes a few hundred pixels a few kilometers across.
const ZOOM_IN_AFTER_SEARCH = 4;

test.describe('PlantingSiteTests', () => {
  test.use({ viewport: { width: 1600, height: 1200 } });
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enableSiteEditorPreferences(page);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
    await goToPlantingSites(page);
  });

  test('Simple site: draw and upload a boundary, save, edit, and delete the draft', async ({ page }) => {
    const siteName = `Simple Site ${Date.now()}`;

    await page.getByRole('button', { name: 'Add Planting Site' }).click();
    await expect(page.getByText('Select Planting Site Type')).toBeVisible();
    await expect(page.locator('#next')).toBeDisabled();
    await selectSiteType(page, 'Simple Site');
    await expect(page.locator('#next')).toBeEnabled();
    await page.locator('#cancel').click();
    await expect(page.getByText('Select Planting Site Type')).toBeHidden();

    // Closing an untouched site leaves without asking.
    await startNewPlantingSite(page, 'Simple Site');
    await editorButton(page, 'Close').click();
    await expect(page).toHaveURL(/\/planting-sites(\?|$)/);

    // Closing an unnamed site offers only to discard it.
    await startNewPlantingSite(page, 'Simple Site');
    await descriptionField(page).fill('Never saved');
    await editorButton(page, 'Close').click();
    await expect(page.getByText('Discard this site?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save as draft' })).toBeHidden();
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.getByText('Discard this site?')).toBeHidden();

    await page.locator('#name input').fill(siteName);
    await editorButton(page, 'Close').click();
    await expect(page.getByText('Close site setup?')).toBeVisible();
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.locator('#name input')).toHaveValue(siteName);
    await editorButton(page, 'Close').click();
    await page.getByRole('button', { name: 'Discard', exact: true }).click();
    await expect(page).toHaveURL(/\/planting-sites(\?|$)/);
    await page.getByRole('tab', { name: 'Draft Planting Sites' }).click();
    await expect(page.getByRole('link', { name: siteName })).toBeHidden();

    // Save as a draft from the close confirmation.
    await startNewPlantingSite(page, 'Simple Site');
    await page.locator('#name input').fill(siteName);
    await descriptionField(page).fill('First description');
    await editorButton(page, 'Close').click();
    await page.getByRole('button', { name: 'Save as draft' }).click();

    await expect(page).toHaveURL(/\/planting-sites\/draft\/\d+(\?|$)/);
    const main = page.getByRole('main');
    await expect(main.getByText(siteName, { exact: true }).first()).toBeVisible();
    await expect(detailField(page, 'Name')).toHaveText(siteName);
    await expect(main.getByText('Draft', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Draft' })).toBeVisible();
    await expect(main.getByText('The site boundary hasn’t been set up', { exact: false })).toBeVisible();
    await expect(detailField(page, 'Description')).toHaveText('First description');
    await expect(main.getByText('No site boundary yet')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Edit Details' })).toBeHidden();

    // Resume setup at the Details step, where it was saved, and edit the description.
    await page.getByRole('button', { name: 'Continue with Details' }).click();
    await expect(page).toHaveURL(/\/planting-sites\/draft\/\d+\/edit(\?|$)/);
    await expectActiveStep(page, 'Details');
    await expect(page.getByRole('button', { name: 'Reset Boundary Setup' })).toBeHidden();
    await expect(descriptionField(page)).toHaveValue('First description');
    await descriptionField(page).fill('Edited description');
    await editorButton(page, 'Next').click();

    // Draw the boundary on the map.
    await expectActiveStep(page, 'Site Boundary');
    await expect(editorButton(page, 'Back')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Boundary Setup' })).toBeHidden();
    await expect(page.getByText('How do you want to define this boundary?')).toBeVisible();
    await page.locator('#choose-draw-boundary').click();
    await expect(page.getByText('Drawing the boundary on the map.')).toBeVisible();
    await waitForMap(page);
    await searchMapLocation(page, SITE_ADDRESS);
    await zoomMapIn(page, ZOOM_IN_AFTER_SEARCH);
    await drawPolygon(page, [
      [0.25, 0.25],
      [0.75, 0.25],
      [0.75, 0.75],
      [0.25, 0.75],
    ]);
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    await editorButton(page, 'Next').click();
    await expectActiveStep(page, 'Exclusion Areas');
    await expect(page.getByText('Unsaved changes')).toBeHidden();
    await expect(editorButton(page, 'Create Planting Site')).toBeVisible();

    // Going back keeps the drawn boundary, so the method chooser stays hidden.
    await editorButton(page, 'Back').click();
    await expectActiveStep(page, 'Site Boundary');
    await waitForMap(page);
    await expect(page.getByText('How do you want to define this boundary?')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Reset Boundary Setup' })).toBeVisible();
    await editorButton(page, 'Next').click();
    await expect(editorButton(page, 'Create Planting Site')).toBeVisible();

    // Start over: dismiss once, then confirm.
    await page.getByRole('button', { name: 'Reset Boundary Setup' }).click();
    await expect(
      page.getByText('Site boundary, exclusion area, stratum and substratum boundaries will be cleared', {
        exact: false,
      })
    ).toBeVisible();
    await page.locator('#cancelStartOver').click();
    await expect(editorButton(page, 'Create Planting Site')).toBeVisible();
    await page.getByRole('button', { name: 'Reset Boundary Setup' }).click();
    await page.locator('#confirmStartOver').click();
    await expectActiveStep(page, 'Site Boundary');
    await expect(page.getByText('How do you want to define this boundary?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Boundary Setup' })).toBeHidden();

    // Upload a boundary file instead.
    await page.locator('#choose-upload-boundary').click();
    await expect(page.getByText('Upload Site Boundary').first()).toBeVisible();
    await page.locator('#cancel-upload-boundary').click();
    await expect(page.getByText('How do you want to define this boundary?')).toBeVisible();
    await page.locator('#choose-upload-boundary').click();
    await page.locator('input[type="file"]').setInputFiles(BOUNDARY_FIXTURE);
    await page.locator('#confirm-upload-boundary').click();
    await expect(page.getByText('simpleSiteBoundary.geojson', { exact: false })).toBeVisible();
    await expect(page.locator('#remove-boundary-file')).toBeVisible();

    await editorButton(page, 'Close').click();
    await expect(page.getByText('Close site setup?')).toBeVisible();
    await page.getByRole('button', { name: 'Save and Close' }).click();

    await expect(page).toHaveURL(/\/planting-sites\/draft\/\d+(\?|$)/);
    await expect(main.getByText('Boundary setup isn’t finished', { exact: false })).toBeVisible();
    await expect(detailField(page, 'Setup Remaining')).toHaveText('Site Boundary');
    await expect(detailField(page, 'Total Area')).toContainText('ha');
    await expect(page.getByRole('button', { name: 'Continue Boundary Setup' })).toBeVisible();

    await openDraftPlantingSite(page, siteName);
    await expect(page).toHaveURL(/\/planting-sites\/draft\/\d+(\?|$)/);
    await expect(detailField(page, 'Description')).toHaveText('Edited description');

    // Delete the draft: cancel once, then confirm.
    await page.getByRole('button', { name: 'Delete Draft' }).click();
    await expect(page.getByText('Delete this draft?')).toBeVisible();
    await page.locator('#cancelDeletePlantingSite').click();
    await expect(page.getByText('Delete this draft?')).toBeHidden();
    await page.getByRole('button', { name: 'Delete Draft' }).click();
    await page.locator('#saveDeletePlantingSite').click();

    await expect(page).toHaveURL(/\/planting-sites(\?|$)/);
    await expect(page.getByText('Planting site deleted!')).toBeVisible();
    await page.getByRole('tab', { name: 'Draft Planting Sites' }).click();
    await expect(page.getByRole('link', { name: siteName })).toBeHidden({ timeout: 2000 });
  });

  test('Detailed site: draw strata, substrata, and exclusions, then create and delete the site', async ({ page }) => {
    const siteName = `Detailed Site ${Date.now()}`;
    const stratumName = 'West';
    const substratumName = 'North';

    await startNewPlantingSite(page, 'Detailed Site');
    await expect(page.getByText('Detailed Planting Site Map')).toBeVisible();
    await expect(page.getByText('Stratum Boundaries', { exact: true })).toBeVisible();
    await expect(page.getByText('Substratum Boundaries', { exact: true })).toBeVisible();

    // Next validates the name before creating the draft.
    await editorButton(page, 'Next').click();
    await expect(page.getByText('Required Field')).toBeVisible();
    await page.locator('#name input').fill(siteName);
    await editorButton(page, 'Next').click();

    await expect(page).toHaveURL(/\/planting-sites\/draft\/\d+\/edit(\?|$)/);
    await expectActiveStep(page, 'Site Boundary');
    await page.locator('#choose-draw-boundary').click();
    await waitForMap(page);
    await searchMapLocation(page, SITE_ADDRESS);
    await zoomMapIn(page, ZOOM_IN_AFTER_SEARCH);
    await drawPolygon(page, [
      [0.1, 0.1],
      [0.9, 0.1],
      [0.9, 0.9],
      [0.1, 0.9],
    ]);
    await editorButton(page, 'Next').click();

    // Exclusions: the map is now fitted to the site boundary.
    await expectActiveStep(page, 'Exclusion Areas');
    await waitForMap(page);
    await drawPolygon(page, [
      [0.75, 0.75],
      [0.9, 0.75],
      [0.9, 0.9],
      [0.75, 0.9],
    ]);
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    await editorButton(page, 'Next').click();

    // Strata: slice off the west half of the site and name it.
    await expectActiveStep(page, 'Stratum Boundaries');
    await expect(page.getByText('Unsaved changes')).toBeHidden();
    await waitForMap(page);
    await drawPolygon(page, [
      [-0.1, -0.02],
      [0.5, -0.02],
      [0.5, 1.02],
      [-0.1, 1.02],
    ]);
    const stratumNameInput = page.locator('#stratum-name input');
    await expect(stratumNameInput).toBeVisible();
    await stratumNameInput.fill(stratumName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(stratumNameInput).toBeHidden();
    await editorButton(page, 'Next').click();

    // Substrata: slice the north half off the selected stratum.
    await expectActiveStep(page, 'Substratum Boundaries');
    await expect(page.getByText('Unsaved changes')).toBeHidden();
    await expect(editorButton(page, 'Create Planting Site')).toBeVisible();
    await waitForMap(page);
    await drawPolygon(page, [
      [-0.1, -0.02],
      [1.1, -0.02],
      [1.1, 0.5],
      [-0.1, 0.5],
    ]);
    const substratumNameInput = page.locator('#substratum-name input');
    await expect(substratumNameInput).toBeVisible();
    await substratumNameInput.fill(substratumName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(substratumNameInput).toBeHidden();

    // Going back saves the substrata, and the strata step still has the named stratum.
    await editorButton(page, 'Back').click();
    await expectActiveStep(page, 'Stratum Boundaries');
    await expect(page.getByText('Unsaved changes')).toBeHidden();
    await waitForMap(page);
    await clickMap(page, [0.25, 0.5]);
    await expect(stratumNameInput).toHaveValue(stratumName);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await editorButton(page, 'Next').click();
    await expectActiveStep(page, 'Substratum Boundaries');

    // Nothing is unsaved, so closing goes straight to the draft.
    await editorButton(page, 'Close').click();
    await expect(page).toHaveURL(/\/planting-sites\/draft\/\d+(\?|$)/);
    await expect(page.getByRole('main').getByText('Draft', { exact: true })).toBeVisible();
    await expect(detailField(page, 'Name')).toHaveText(siteName);
    await expect(detailField(page, 'Strata')).toHaveText('2');
    await expect(detailField(page, 'Substrata')).toHaveText('3');
    await expect(detailField(page, 'Exclusion Areas')).toContainText('ha');
    await expect(detailField(page, 'Setup Remaining')).toHaveText('Substratum Boundaries');

    // Resume setup on the last step and create the site.
    await page.getByRole('button', { name: 'Continue with Substratum Boundaries' }).click();
    await expectActiveStep(page, 'Substratum Boundaries');
    await expect(editorButton(page, 'Back')).toBeVisible();
    await editorButton(page, 'Create Planting Site').click();

    await expect(page).toHaveURL(/\/planting-sites\/\d+(\?|$)/);
    await expect(page.getByRole('button', { name: 'Delete Planting Site' })).toBeVisible();
    await expect(detailField(page, 'Name')).toHaveText(siteName);
    await expect(page.getByText('Draft', { exact: true })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Continue with Substratum Boundaries' })).toBeHidden();

    await goToPlantingSites(page);
    await expect(page.getByRole('link', { name: siteName })).toBeVisible();
    await page.getByRole('tab', { name: 'Draft Planting Sites' }).click();
    await expect(page.getByRole('link', { name: siteName })).toBeHidden();
    await page.getByRole('tab', { name: 'Planting Sites', exact: true }).click();
    await page.getByRole('link', { name: siteName }).click();

    // Delete the created site: cancel once, then confirm.
    await page.getByRole('button', { name: 'Delete Planting Site' }).click();
    await expect(page.getByText('Are you sure?')).toBeVisible();
    await page.locator('#cancelDeletePlantingSite').click();
    await expect(page.getByText('Are you sure?')).toBeHidden();
    await page.getByRole('button', { name: 'Delete Planting Site' }).click();
    await page.locator('#saveDeletePlantingSite').click();

    await expect(page).toHaveURL(/\/planting-sites(\?|$)/);
    await expect(page.getByText('Planting site deleted!')).toBeVisible();
    await expect(page.getByRole('link', { name: siteName })).toBeHidden({ timeout: 2000 });
  });
});
