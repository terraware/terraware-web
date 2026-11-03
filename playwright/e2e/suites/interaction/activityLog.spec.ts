import { Locator, Page, expect, test } from '@playwright/test';

import {
  TEST_ACTIVITY_PREFIX,
  deleteTestActivities,
  getProjectDealName,
  seedActivity,
} from '../../utils/activityUtils';
import { navigateToAcceleratorActivityLog } from '../../utils/navigation';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions } from '../../utils/utils';

const PHASE_0_PROJECT_ID = 2;
const PHASE_1_PROJECT_ID = 3;
const PHASE_2_PROJECT_ID = 4;

const selectWithLabel = (page: Page, label: string): Locator =>
  page.locator('.select').filter({ has: page.locator('label', { hasText: label }) });

const selectDropdownOption = async (select: Locator, option: string) => {
  await select.locator('input').click();
  await select.locator('.options-container').getByText(option, exactOptions).click();
};

const selectDealName = async (page: Page, dealName: string) => {
  const projectSelect = page.locator('.select').filter({ has: page.locator('#projectId') });
  await selectDropdownOption(projectSelect, dealName);
  await expect(projectSelect.locator('input')).toHaveValue(dealName);
};

// The Textfield id lands on the label's htmlFor but not on the rendered textarea, so match the label instead.
const fillDescription = async (page: Page, description: string) => {
  const field = page.locator('.textfield').filter({ has: page.locator('label', { hasText: 'Description' }) });
  await field.locator('textarea').fill(description);
};

const saveActivity = async (page: Page) => {
  await page.locator('#saveActivity').click();
  await expect(page.locator('#saveActivity')).toBeHidden();
};

const saveNewActivity = async (page: Page): Promise<number> => {
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes('/api/v1/accelerator/activities/admin')
    ),
    page.locator('#saveActivity').click(),
  ]);

  const { activity } = (await response.json()) as { activity: { id: number } };
  await expect(page.locator('#saveActivity')).toBeHidden();
  return activity.id;
};

const openActivity = async (page: Page, activityId: number) => {
  await page.locator(`#activity-log-item-${activityId}`).click();
  await expect(page.locator('#crumb_0')).toBeVisible();
};

const backToList = async (page: Page) => {
  await page.locator('#crumb_0').click();
  await expect(page.locator('#crumb_0')).toBeHidden();
};

const badge = (page: Page, label: string): Locator => page.getByText(label, exactOptions);

let createdActivityIds: number[] = [];
let projectUnderTest = PHASE_0_PROJECT_ID;

const useProject = async (page: Page, projectId: number): Promise<string> => {
  projectUnderTest = projectId;
  await deleteTestActivities(page.request, projectId, []);
  return await getProjectDealName(page.request, projectId);
};

test.describe('ActivityLogTests', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    createdActivityIds = [];
  });

  test.afterEach(async ({ page }) => {
    await deleteTestActivities(page.request, projectUnderTest, createdActivityIds);
  });

  test('creates, edits and deletes an activity', async ({ page }) => {
    const dealName = await useProject(page, PHASE_0_PROJECT_ID);

    await navigateToAcceleratorActivityLog(page);
    await selectDealName(page, dealName);
    await expect(page.getByText('This project has no Activities')).toBeVisible();

    await page.getByRole('button', { name: 'Add Activity' }).click();
    await expect(page.getByRole('heading', { name: `Add Activity for ${dealName}` })).toBeVisible();

    const description = `${TEST_ACTIVITY_PREFIX}created activity ${Date.now()}`;
    await selectDropdownOption(page.locator('#activity-type-field .select'), 'Site Visit');
    await fillDescription(page, description);
    await selectDropdownOption(selectWithLabel(page, 'Status'), 'Not Verified');
    createdActivityIds.push(await saveNewActivity(page));

    const listItem = page.locator('[id^=activity-log-item-]').filter({ hasText: description });
    await expect(listItem).toBeVisible();
    await expect(listItem.getByText('Site Visit', exactOptions)).toBeVisible();
    await expect(listItem.getByText('Not Verified', exactOptions)).toBeVisible();

    await listItem.click();
    await expect(page.locator('#crumb_0')).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();

    const editedDescription = `${description} edited`;
    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await expect(page.getByRole('heading', { name: `Editing Activity for ${dealName}` })).toBeVisible();
    await selectDropdownOption(page.locator('#activity-type-field .select'), 'Planting');
    await fillDescription(page, editedDescription);
    await saveActivity(page);

    await expect(page.getByText(editedDescription)).toBeVisible();
    await expect(page.getByText('Planting', exactOptions)).toBeVisible();

    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await page.getByRole('button', { name: 'Delete Activity' }).click();
    await expect(
      page.getByText('Are you sure you want to delete this activity? All activity data will be removed.')
    ).toBeVisible();
    await page.locator('#cancelDeleteActivity').click();
    await expect(page.locator('#confirmDeleteActivity')).toBeHidden();

    await page.getByRole('button', { name: 'Delete Activity' }).click();
    await page.locator('#confirmDeleteActivity').click();

    await expect(page.getByText('This project has no Activities')).toBeVisible();
    await expect(page.getByText(editedDescription)).toBeHidden();
  });

  test('verifies and publishes an activity, then flags later edits as unpublished changes', async ({ page }) => {
    const dealName = await useProject(page, PHASE_1_PROJECT_ID);
    const activity = await seedActivity(page.request, {
      date: '2026-05-10',
      description: 'publishable activity',
      projectId: PHASE_1_PROJECT_ID,
      status: 'Not Verified',
      type: 'Seed Collection',
    });
    createdActivityIds.push(activity.id);

    await navigateToAcceleratorActivityLog(page);
    await selectDealName(page, dealName);

    const listItem = page.locator(`#activity-log-item-${activity.id}`);
    await expect(listItem.getByText('Not Verified', exactOptions)).toBeVisible();

    await openActivity(page, activity.id);
    const publishButton = page.getByRole('button', { name: 'Publish Activity' });
    await expect(publishButton).toBeDisabled();

    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await selectDropdownOption(selectWithLabel(page, 'Status'), 'Verified');
    await saveActivity(page);

    await expect(badge(page, 'Verified')).toBeVisible();
    await expect(page.getByText('You have unpublished changes')).toBeVisible();
    await expect(publishButton).toBeEnabled();

    await publishButton.click();
    await expect(
      page.getByText(`You are about to publish ${activity.type} from ${activity.date}. Are you sure?`)
    ).toBeVisible();
    await page.locator('#cancelPublishActivity').click();
    await expect(page.locator('#publishActivity')).toBeHidden();
    await expect(page.getByText('You have unpublished changes')).toBeVisible();

    await publishButton.click();
    await page.locator('#publishActivity').click();
    await expect(page.getByText('Activity published')).toBeVisible();

    await expect(badge(page, 'Published')).toBeVisible();
    await expect(page.getByText('You have unpublished changes')).toBeHidden();
    await expect(badge(page, 'Unpublished Changes')).toBeHidden();

    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await fillDescription(page, `${activity.description} revised`);
    await saveActivity(page);

    await expect(page.getByText(`${activity.description} revised`)).toBeVisible();
    await expect(badge(page, 'Unpublished Changes')).toBeVisible();
    await expect(badge(page, 'Published')).toBeVisible();
    await expect(page.getByText('You have unpublished changes')).toBeVisible();

    await backToList(page);
    await expect(listItem.getByText('Unpublished Changes', exactOptions)).toBeVisible();
    await expect(listItem.getByText('Published', exactOptions)).toBeVisible();
  });

  test('marks an activity as a highlight and shows it in the highlights preview', async ({ page }) => {
    const dealName = await useProject(page, PHASE_2_PROJECT_ID);
    const activity = await seedActivity(page.request, {
      date: '2026-08-12',
      description: 'highlighted activity',
      projectId: PHASE_2_PROJECT_ID,
      status: 'Verified',
      type: 'Planting',
    });
    createdActivityIds.push(activity.id);

    await navigateToAcceleratorActivityLog(page);
    await selectDealName(page, dealName);
    await expect(page.locator(`#activity-log-item-${activity.id}`)).toBeVisible();

    await page.locator('#previewHighlights').click();
    const highlightsDialog = page.getByRole('dialog');
    await expect(highlightsDialog.getByText('No highlights yet.')).toBeVisible();

    // The highlights modal has no labelled close control, so reload to dismiss it.
    await page.reload();
    await expect(page.locator(`#activity-log-item-${activity.id}`)).toBeVisible();

    await openActivity(page, activity.id);
    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await page.getByRole('checkbox', { name: 'Make Highlight' }).check();
    await saveActivity(page);

    await backToList(page);
    // The star is an unlabelled svg; its tooltip is the only accessible text identifying it.
    await page.locator(`#activity-log-item-${activity.id}`).locator('svg.tw-icon').hover();
    await expect(page.getByRole('tooltip', { name: 'Highlighted Activity' })).toBeVisible();

    await page.locator('#previewHighlights').click();
    await expect(page.getByRole('dialog', { name: dealName })).toBeVisible();
    await expect(highlightsDialog.getByText(activity.description)).toBeVisible();
    await expect(highlightsDialog.getByText(activity.type, exactOptions)).toBeVisible();
    await expect(highlightsDialog.getByText('No highlights yet.')).toBeHidden();
  });
});
