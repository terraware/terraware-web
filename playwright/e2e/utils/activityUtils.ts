import { APIRequestContext, expect } from '@playwright/test';

const JSON_HEADERS = { Accept: 'application/json' };

const postJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.post(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `POST ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const getJson = async <T>(request: APIRequestContext, url: string): Promise<T> => {
  const response = await request.get(url, { headers: JSON_HEADERS });
  expect(response.ok(), `GET ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

export const TEST_ACTIVITY_PREFIX = 'E2E ';

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
  projectId: number;
  status?: ActivityStatus;
  type?: ActivityType;
};

export type SeededActivity = {
  date: string;
  description: string;
  id: number;
  projectId: number;
  type: ActivityType;
};

export const seedActivity = async (
  request: APIRequestContext,
  {
    date,
    description,
    isHighlight = false,
    projectId,
    status = 'Not Verified',
    type = 'Seed Collection',
  }: SeedActivityOptions
): Promise<SeededActivity> => {
  const activityDescription = `${TEST_ACTIVITY_PREFIX}${description} ${Date.now()}`;

  const { activity } = await postJson<{ activity: { id: number } }>(request, '/api/v1/accelerator/activities/admin', {
    date,
    description: activityDescription,
    isHighlight,
    projectId,
    status,
    type,
  });

  return { date, description: activityDescription, id: activity.id, projectId, type };
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
  createdActivityIds: number[]
): Promise<void> => {
  const { activities } = await getJson<{ activities: { description?: string; id: number }[] }>(
    request,
    `/api/v1/accelerator/activities/admin?projectId=${projectId}`
  );

  const orphaned = activities
    .filter(({ description, id }) => !createdActivityIds.includes(id) && description?.startsWith(TEST_ACTIVITY_PREFIX))
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
