import { Page, expect, test } from '@playwright/test';

import {
  FUNDER_TEST_ACTIVITY_PREFIX,
  SeedActivityOptions,
  backToList,
  badge,
  deleteTestActivities,
  openActivity,
  seedActivity,
  verifyAndPublishActivity,
} from '../../utils/activityUtils';
import { navigateToFunderProjectTab } from '../../utils/navigation';
import { publishProjectProfileViaApi } from '../../utils/projectProfile';
import { changeToFunderUser, changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions } from '../../utils/utils';

// The only project wired to the funder user's funding entity in the dump.
const PHASE_1_PROJECT_ID = 3;

let createdActivityIds: number[] = [];

const seedFunderActivity = async (page: Page, options: Omit<SeedActivityOptions, 'prefix' | 'projectId'>) => {
  const activity = await seedActivity(page.request, {
    ...options,
    prefix: FUNDER_TEST_ACTIVITY_PREFIX,
    projectId: PHASE_1_PROJECT_ID,
  });
  createdActivityIds.push(activity.id);
  return activity;
};

/**
 * Funders can't see a project until its profile is published, so that has to happen even for tests
 * that only care about activities. Leftovers are swept here as well as in teardown, since an
 * interrupted run never reaches afterEach.
 */
const useProject = async (page: Page) => {
  await deleteTestActivities(page.request, PHASE_1_PROJECT_ID, [], FUNDER_TEST_ACTIVITY_PREFIX);
  await publishProjectProfileViaApi(page.request, PHASE_1_PROJECT_ID);
};

test.describe('FunderActivityLogTests', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    createdActivityIds = [];
  });

  test.afterEach(async ({ page, context, baseURL }) => {
    // The funder user can't delete activities, and every test ends as that user.
    await changeToSuperAdmin(context, baseURL);
    await deleteTestActivities(page.request, PHASE_1_PROJECT_ID, createdActivityIds, FUNDER_TEST_ACTIVITY_PREFIX);
  });

  test('shows published activities only, without any review state or editing controls', async ({
    page,
    context,
    baseURL,
  }) => {
    await useProject(page);
    const published = await seedFunderActivity(page, {
      date: '2026-07-04',
      description: 'published activity',
      type: 'Planting',
    });
    await verifyAndPublishActivity(page.request, published.id);

    const unpublished = await seedFunderActivity(page, {
      date: '2026-07-06',
      description: 'unpublished activity',
      type: 'Site Visit',
    });

    await changeToFunderUser(context, baseURL);
    await navigateToFunderProjectTab(page, 'Project Activity');

    const listItem = page.locator(`#activity-log-item-${published.id}`);
    await expect(listItem.getByText(published.description)).toBeVisible();
    await expect(listItem.getByText('Planting', exactOptions)).toBeVisible();

    await expect(page.locator(`#activity-log-item-${unpublished.id}`)).toHaveCount(0);
    await expect(page.getByText(unpublished.description)).toHaveCount(0);

    await expect(badge(page, 'Published')).toHaveCount(0);
    await expect(badge(page, 'Verified')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add Activity' })).toHaveCount(0);

    await openActivity(page, published.id);
    await expect(page.getByText(published.description)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Activity' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Publish Activity' })).toHaveCount(0);

    await backToList(page);
    await expect(listItem.getByText(published.description)).toBeVisible();
  });

  test('shows a highlighted activity in the list and the quarterly highlights carousel', async ({
    page,
    context,
    baseURL,
  }) => {
    await useProject(page);
    const highlight = await seedFunderActivity(page, {
      date: '2026-08-12',
      description: 'highlighted activity',
      isHighlight: true,
      type: 'Drone Flight',
    });
    await verifyAndPublishActivity(page.request, highlight.id);

    await changeToFunderUser(context, baseURL);
    await navigateToFunderProjectTab(page, 'Project Activity');

    // The star is an unlabelled svg; its tooltip is the only accessible text identifying it.
    await page.locator(`#activity-log-item-${highlight.id}`).locator('svg.tw-icon').hover();
    await expect(page.getByRole('tooltip', { name: 'Highlighted Activity' })).toBeVisible();

    await page.getByRole('tab', { name: 'Quarterly Highlights' }).click();
    // The quarter the activity falls in is the only one with highlights, so it's selected by default.
    await expect(page.locator('.select input')).toHaveValue('Q3 2026');

    const slide = page.locator('.swiper-slide').filter({ hasText: highlight.description }).first();
    await expect(slide.getByText('Drone Flight', exactOptions)).toBeVisible();

    // Only the card at the bottom of the slide opens the activity; the rest of the slide is backdrop.
    await slide.getByText(highlight.description).click();
    await expect(page.locator('#crumb_0')).toBeVisible();
    await expect(page.getByText(highlight.description)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Activity' })).toHaveCount(0);
  });
});
