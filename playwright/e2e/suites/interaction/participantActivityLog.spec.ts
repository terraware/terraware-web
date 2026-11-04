import { Page, expect, test } from '@playwright/test';

import {
  PARTICIPANT_TEST_ACTIVITY_PREFIX,
  backToList,
  badge,
  deleteTestActivities,
  fillDescription,
  openActivity,
  saveActivity,
  saveNewActivity,
  seedActivity,
  selectActivityLogProject,
  selectDropdownOption,
  selectWithLabel,
  verifyAndPublishActivity,
} from '../../utils/activityUtils';
import { navigateToActivityLog } from '../../utils/navigation';
import { changeToReadOnlyUser, changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions } from '../../utils/utils';

const ORG_NAME = 'Terraformation (staging)';

// Phase 0 Project is left alone because the Console spec expects it to have no activities.
const PHASE_1_PROJECT_ID = 3;
const PHASE_1_PROJECT_NAME = 'Phase 1 Project';

const expectNoAdminOnlyFormFields = async (page: Page) => {
  await expect(selectWithLabel(page, 'Status')).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Make Highlight' })).toHaveCount(0);
};

let createdActivityIds: number[] = [];
let projectUnderTest = PHASE_1_PROJECT_ID;

const useProject = async (page: Page, projectId: number) => {
  projectUnderTest = projectId;
  await deleteTestActivities(page.request, projectId, [], PARTICIPANT_TEST_ACTIVITY_PREFIX);
};

test.describe('ParticipantActivityLogTests', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    createdActivityIds = [];
  });

  test.afterEach(async ({ page, context, baseURL }) => {
    // Some tests switch to a user who can't delete activities.
    await changeToSuperAdmin(context, baseURL);
    await deleteTestActivities(page.request, projectUnderTest, createdActivityIds, PARTICIPANT_TEST_ACTIVITY_PREFIX);
  });

  test('creates and edits an activity, then locks it once an admin publishes it', async ({ page }) => {
    await useProject(page, PHASE_1_PROJECT_ID);

    await navigateToActivityLog(page, ORG_NAME);
    await selectActivityLogProject(page, PHASE_1_PROJECT_NAME);
    await expect(page.locator('#previewHighlights')).toHaveCount(0);

    await page.getByRole('button', { name: 'Add Activity' }).click();
    await expect(page.getByRole('heading', { name: `Add Activity for ${PHASE_1_PROJECT_NAME}` })).toBeVisible();
    await expectNoAdminOnlyFormFields(page);

    const description = `${PARTICIPANT_TEST_ACTIVITY_PREFIX}created activity ${Date.now()}`;
    await selectDropdownOption(page.locator('#activity-type-field .select'), 'Site Visit');
    await fillDescription(page, description);
    const activityId = await saveNewActivity(page);
    createdActivityIds.push(activityId);

    const listItem = page.locator(`#activity-log-item-${activityId}`);
    await expect(listItem).toBeVisible();
    await expect(listItem.getByText(description)).toBeVisible();
    await expect(listItem.getByText('Site Visit', exactOptions)).toBeVisible();
    await expect(listItem.getByText('Not Verified', exactOptions)).toHaveCount(0);

    await openActivity(page, activityId);
    await expect(page.getByText(description)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Activity' })).toHaveCount(0);

    const editedDescription = `${description} edited`;
    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await expect(page.getByRole('heading', { name: `Editing Activity for ${PHASE_1_PROJECT_NAME}` })).toBeVisible();
    await expectNoAdminOnlyFormFields(page);
    await selectDropdownOption(page.locator('#activity-type-field .select'), 'Planting');
    await fillDescription(page, editedDescription);
    await saveActivity(page);

    await expect(page.getByText(editedDescription)).toBeVisible();
    await expect(page.getByText('Planting', exactOptions)).toBeVisible();

    // Confirming a delete is covered by the Console spec, which uses the same form and endpoint.
    await page.getByRole('button', { name: 'Edit Activity' }).click();
    await page.getByRole('button', { name: 'Delete Activity' }).click();
    await expect(
      page.getByText('Are you sure you want to delete this activity? All activity data will be removed.')
    ).toBeVisible();
    await page.locator('#cancelDeleteActivity').click();
    await expect(page.locator('#confirmDeleteActivity')).toBeHidden();
    await page.locator('#cancelSaveActivity').click();
    await expect(page.locator('#crumb_0')).toBeVisible();

    await verifyAndPublishActivity(page.request, activityId);
    await page.reload();

    await expect(page.getByText(editedDescription)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Activity' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Publish Activity' })).toHaveCount(0);
    await expect(badge(page, 'Published')).toHaveCount(0);
    await expect(badge(page, 'Verified')).toHaveCount(0);

    await backToList(page);
    await expect(listItem.getByText(editedDescription)).toBeVisible();
    await expect(listItem.getByText('Published', exactOptions)).toHaveCount(0);
  });

  test('lets a read-only user view activities but not add or edit them', async ({ page, context, baseURL }) => {
    await useProject(page, PHASE_1_PROJECT_ID);
    const activity = await seedActivity(page.request, {
      date: '2026-06-15',
      description: 'read-only activity',
      prefix: PARTICIPANT_TEST_ACTIVITY_PREFIX,
      projectId: PHASE_1_PROJECT_ID,
      type: 'Drone Flight',
    });
    createdActivityIds.push(activity.id);

    await changeToReadOnlyUser(context, baseURL);
    await navigateToActivityLog(page, ORG_NAME);
    await selectActivityLogProject(page, PHASE_1_PROJECT_NAME);

    const listItem = page.locator(`#activity-log-item-${activity.id}`);
    await expect(listItem.getByText(activity.description)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Activity' })).toHaveCount(0);

    await openActivity(page, activity.id);
    await expect(page.getByText(activity.description)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Activity' })).toHaveCount(0);
  });
});
