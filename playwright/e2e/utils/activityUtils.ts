import { APIRequestContext, Locator, Page, expect } from '@playwright/test';

import { exactOptions } from './utils';

const JSON_HEADERS = { Accept: 'application/json' };

const postJson = async <T>(request: APIRequestContext, url: string, data?: unknown): Promise<T> => {
  const response = await request.post(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `POST ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const putJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.put(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `PUT ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const getJson = async <T>(request: APIRequestContext, url: string): Promise<T> => {
  const response = await request.get(url, { headers: JSON_HEADERS });
  expect(response.ok(), `GET ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

export const TEST_ACTIVITY_PREFIX = 'E2E ';

// Must not start with TEST_ACTIVITY_PREFIX, or the Console spec's orphan cleanup would delete these mid-test.
export const PARTICIPANT_TEST_ACTIVITY_PREFIX = 'Participant E2E ';

export type ActivityStatus = 'Not Verified' | 'Verified' | 'Do Not Use';

export type ActivityType =
  | 'Seed Collection'
  | 'Nursery and Propagule Operations'
  | 'Planting'
  | 'Monitoring'
  | 'Site Visit'
  | 'Social Impact'
  | 'Drone Flight'
  | 'Others';

export type SeedActivityOptions = {
  date: string;
  description: string;
  isHighlight?: boolean;
  prefix?: string;
  projectId: number;
  status?: ActivityStatus;
  type?: ActivityType;
};

export type SeededActivity = {
  date: string;
  description: string;
  id: number;
  isHighlight: boolean;
  projectId: number;
  type: ActivityType;
};

export const seedActivity = async (
  request: APIRequestContext,
  {
    date,
    description,
    isHighlight = false,
    prefix = TEST_ACTIVITY_PREFIX,
    projectId,
    status = 'Not Verified',
    type = 'Seed Collection',
  }: SeedActivityOptions
): Promise<SeededActivity> => {
  const activityDescription = `${prefix}${description} ${Date.now()}`;

  const { activity } = await postJson<{ activity: { id: number } }>(request, '/api/v1/accelerator/activities/admin', {
    date,
    description: activityDescription,
    isHighlight,
    projectId,
    status,
    type,
  });

  return { date, description: activityDescription, id: activity.id, isHighlight, projectId, type };
};

export const verifyAndPublishActivity = async (request: APIRequestContext, activity: SeededActivity): Promise<void> => {
  const { date, description, id, isHighlight, type } = activity;
  await putJson(request, `/api/v1/accelerator/activities/admin/${id}`, {
    date,
    description,
    isHighlight,
    status: 'Verified',
    type,
  });
  await postJson(request, `/api/v1/accelerator/activities/admin/${id}/publish`);
};

export const deleteActivities = async (request: APIRequestContext, activityIds: number[]): Promise<void> => {
  for (const id of activityIds) {
    const response = await request.delete(`/api/v1/accelerator/activities/${id}`, { headers: JSON_HEADERS });
    expect(
      response.ok() || response.status() === 404,
      `Failed to delete activity ${id}: ${response.status()}`
    ).toBeTruthy();
  }
};

export const deleteTestActivities = async (
  request: APIRequestContext,
  projectId: number,
  createdActivityIds: number[],
  prefix = TEST_ACTIVITY_PREFIX
): Promise<void> => {
  const { activities } = await getJson<{ activities: { description?: string; id: number }[] }>(
    request,
    `/api/v1/accelerator/activities/admin?projectId=${projectId}`
  );

  const orphaned = activities
    .filter(({ description, id }) => !createdActivityIds.includes(id) && description?.startsWith(prefix))
    .map(({ id }) => id);

  await deleteActivities(request, [...createdActivityIds, ...orphaned]);
};

export const getProjectDealName = async (request: APIRequestContext, projectId: number): Promise<string> => {
  const { details } = await getJson<{ details: { dealName?: string; projectId: number }[] }>(
    request,
    '/api/v1/accelerator/projects'
  );

  const dealName = details.find((project) => project.projectId === projectId)?.dealName;
  expect(dealName, `No deal name for project ${projectId}`).toBeTruthy();
  return dealName!;
};

export const selectWithLabel = (page: Page, label: string): Locator =>
  page.locator('.select').filter({ has: page.locator('label', { hasText: label }) });

export const selectDropdownOption = async (select: Locator, option: string) => {
  await select.locator('input').click();
  await select.locator('.options-container').getByText(option, exactOptions).click();
};

// The Console lists projects by deal name and the participant side by project name, both in the same dropdown.
export const selectActivityLogProject = async (page: Page, projectLabel: string) => {
  const projectSelect = page.locator('.select').filter({ has: page.locator('#projectId') });
  await selectDropdownOption(projectSelect, projectLabel);
  await expect(projectSelect.locator('input')).toHaveValue(projectLabel);
};

// The Textfield id lands on the label's htmlFor but not on the rendered textarea, so match the label instead.
export const fillDescription = async (page: Page, description: string) => {
  const field = page.locator('.textfield').filter({ has: page.locator('label', { hasText: 'Description' }) });
  await field.locator('textarea').fill(description);
};

export const saveActivity = async (page: Page) => {
  await page.locator('#saveActivity').click();
  await expect(page.locator('#saveActivity')).toBeHidden();
};

// Matches both the admin and participant create endpoints, but not media uploads under an activity id.
const CREATE_ACTIVITY_PATH = /^\/api\/v1\/accelerator\/activities(\/admin)?$/;

export const saveNewActivity = async (page: Page): Promise<number> => {
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.request().method() === 'POST' && CREATE_ACTIVITY_PATH.test(new URL(res.url()).pathname)
    ),
    page.locator('#saveActivity').click(),
  ]);

  const { activity } = (await response.json()) as { activity: { id: number } };
  await expect(page.locator('#saveActivity')).toBeHidden();
  return activity.id;
};

export const openActivity = async (page: Page, activityId: number) => {
  await page.locator(`#activity-log-item-${activityId}`).click();
  await expect(page.locator('#crumb_0')).toBeVisible();
};

export const backToList = async (page: Page) => {
  await page.locator('#crumb_0').click();
  await expect(page.locator('#crumb_0')).toBeHidden();
};

export const badge = (page: Page, label: string): Locator => page.getByText(label, exactOptions);
