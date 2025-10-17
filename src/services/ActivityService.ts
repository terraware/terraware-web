import { paths } from 'src/api/types/generated-schema';
import {
  ActivityPayload,
  AdminActivityPayload,
  AdminCreateActivityRequestPayload,
  CreateActivityRequestPayload,
  UpdateActivityMediaRequestPayload,
} from 'src/types/Activity';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

import HttpService, { Response2 } from './HttpService';

const ACTIVITIES_ENDPOINT = '/api/v1/accelerator/activities';
const ACTIVITIES_ADMIN_ENDPOINT = '/api/v1/accelerator/activities/admin';
const ACTIVITY_ADMIN_ENDPOINT = '/api/v1/accelerator/activities/admin/{id}';
const ACTIVITY_ENDPOINT = '/api/v1/accelerator/activities/{activityId}';
const ACTIVITY_MEDIA_ENDPOINT = '/api/v1/accelerator/activities/{activityId}/media';
export const ACTIVITY_MEDIA_FILE_ENDPOINT = '/api/v1/accelerator/activities/{activityId}/media/{fileId}';
const ACTIVITY_MEDIA_STREAM_ENDPOINT = '/api/v1/accelerator/activities/{activityId}/media/{fileId}/stream';

type ListActivitiesResponse = paths[typeof ACTIVITIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type CreateActivityResponse =
  paths[typeof ACTIVITIES_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type AdminCreateActivityResponse =
  paths[typeof ACTIVITIES_ADMIN_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type AdminListActivitiesResponse =
  paths[typeof ACTIVITIES_ADMIN_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type AdminGetActivityResponse =
  paths[typeof ACTIVITY_ADMIN_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type AdminUpdateActivityResponse =
  paths[typeof ACTIVITY_ADMIN_ENDPOINT]['put']['responses'][200]['content']['application/json'];
type GetActivityResponse = paths[typeof ACTIVITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateActivityResponse = paths[typeof ACTIVITY_ENDPOINT]['put']['responses'][200]['content']['application/json'];
type DeleteActivityResponse =
  paths[typeof ACTIVITY_ENDPOINT]['delete']['responses'][200]['content']['application/json'];
type UploadActivityMediaResponse =
  paths[typeof ACTIVITY_MEDIA_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type GetActivityMediaResponse =
  paths[typeof ACTIVITY_MEDIA_FILE_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateActivityMediaResponse =
  paths[typeof ACTIVITY_MEDIA_FILE_ENDPOINT]['put']['responses'][200]['content']['application/json'];
type DeleteActivityMediaResponse =
  paths[typeof ACTIVITY_MEDIA_FILE_ENDPOINT]['delete']['responses'][200]['content']['application/json'];
type GetActivityMediaStreamResponse =
  paths[typeof ACTIVITY_MEDIA_STREAM_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * List all activities for a project
 */
const listActivities = async (
  projectId: number,
  includeMedia?: boolean | undefined,
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<Response2<ListActivitiesResponse>> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }

  const queryParams = {
    projectId: projectId.toString(),
    ...(includeMedia !== undefined && { includeMedia: includeMedia.toString() }),
  };

  const response = await HttpService.root(ACTIVITIES_ENDPOINT).get2<ListActivitiesResponse>({ params: queryParams });

  if (response?.data) {
    response.data.activities = searchAndSort(response?.data?.activities || [], search, searchOrderConfig);
  }

  return response;
};

/**
 * Create a new activity
 */
const createActivity = async (activity: CreateActivityRequestPayload): Promise<Response2<CreateActivityResponse>> => {
  return HttpService.root(ACTIVITIES_ENDPOINT).post2<CreateActivityResponse>({
    entity: activity,
  });
};

/**
 * List all activities for a project with admin details
 */
const adminListActivities = async (
  projectId: number,
  includeMedia?: boolean | undefined,
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<Response2<AdminListActivitiesResponse>> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }

  const queryParams = {
    projectId: projectId.toString(),
    ...(includeMedia !== undefined && { includeMedia: includeMedia.toString() }),
  };

  const response = await HttpService.root(ACTIVITIES_ADMIN_ENDPOINT).get2<AdminListActivitiesResponse>({
    params: queryParams,
  });

  if (response?.data) {
    response.data.activities = searchAndSort(response?.data?.activities || [], search, searchOrderConfig);
  }

  return response;
};

/**
 * Get a single activity with admin details
 */
const adminGetActivity = async (activityId: number): Promise<Response2<AdminGetActivityResponse>> => {
  return HttpService.root(ACTIVITY_ADMIN_ENDPOINT).get2<AdminGetActivityResponse>({
    urlReplacements: { '{id}': activityId.toString() },
  });
};

/**
 * Update an activity with admin details
 */
const adminUpdateActivity = async (
  activityId: number,
  activity: AdminActivityPayload
): Promise<Response2<AdminUpdateActivityResponse>> => {
  return HttpService.root(ACTIVITY_ADMIN_ENDPOINT).put2<AdminUpdateActivityResponse>({
    entity: activity,
    urlReplacements: { '{id}': activityId.toString() },
  });
};

/**
 * Create a new activity with admin details
 */
const adminCreateActivity = async (
  activity: AdminCreateActivityRequestPayload
): Promise<Response2<AdminCreateActivityResponse>> => {
  return HttpService.root(ACTIVITIES_ADMIN_ENDPOINT).post2<AdminCreateActivityResponse>({
    entity: activity,
  });
};

/**
 * Get a single activity
 */
const getActivity = async (activityId: number): Promise<Response2<GetActivityResponse>> => {
  return HttpService.root(ACTIVITY_ENDPOINT).get2<GetActivityResponse>({
    urlReplacements: { '{activityId}': activityId.toString() },
  });
};

/**
 * Update an activity
 */
const updateActivity = async (
  activityId: number,
  activity: ActivityPayload
): Promise<Response2<UpdateActivityResponse>> => {
  return HttpService.root(ACTIVITY_ENDPOINT).put2<UpdateActivityResponse>({
    entity: activity,
    urlReplacements: { '{activityId}': activityId.toString() },
  });
};

/**
 * Delete an activity
 */
const deleteActivity = async (activityId: number): Promise<Response2<DeleteActivityResponse>> => {
  return HttpService.root(ACTIVITY_ENDPOINT).delete2<DeleteActivityResponse>({
    urlReplacements: { '{activityId}': activityId.toString() },
  });
};

/**
 * Upload media for an activity
 */
const uploadActivityMedia = async (
  activityId: number,
  mediaData: FormData
): Promise<Response2<UploadActivityMediaResponse>> => {
  return HttpService.root(ACTIVITY_MEDIA_ENDPOINT).post2<UploadActivityMediaResponse>({
    entity: mediaData,
    urlReplacements: { '{activityId}': activityId.toString() },
  });
};

/**
 * Get activity media file
 */
const getActivityMedia = async (
  activityId: number,
  fileId: number,
  maxWidth?: number | undefined,
  maxHeight?: number | undefined
): Promise<Response2<GetActivityMediaResponse>> => {
  const queryParams = {
    ...(maxWidth !== undefined && { maxWidth: maxWidth.toString() }),
    ...(maxHeight !== undefined && { maxHeight: maxHeight.toString() }),
  };

  return HttpService.root(ACTIVITY_MEDIA_FILE_ENDPOINT).get2<any>({
    params: queryParams,
    urlReplacements: { '{activityId}': activityId.toString(), '{fileId}': fileId.toString() },
  });
};

/**
 * Update activity media file information
 */
const updateActivityMedia = async (
  activityId: number,
  fileId: number,
  mediaUpdateData: UpdateActivityMediaRequestPayload
): Promise<Response2<UpdateActivityMediaResponse>> => {
  return HttpService.root(ACTIVITY_MEDIA_FILE_ENDPOINT).put2<UpdateActivityMediaResponse>({
    entity: mediaUpdateData,
    urlReplacements: { '{activityId}': activityId.toString(), '{fileId}': fileId.toString() },
  });
};

/**
 * Delete activity media file
 */
const deleteActivityMedia = async (
  activityId: number,
  fileId: number
): Promise<Response2<DeleteActivityMediaResponse>> => {
  return HttpService.root(ACTIVITY_MEDIA_FILE_ENDPOINT).delete2<DeleteActivityMediaResponse>({
    urlReplacements: { '{activityId}': activityId.toString(), '{fileId}': fileId.toString() },
  });
};

/**
 * Get activity media stream details
 */
const getActivityMediaStream = async (
  activityId: number,
  fileId: number
): Promise<Response2<GetActivityMediaStreamResponse>> => {
  return HttpService.root(ACTIVITY_MEDIA_STREAM_ENDPOINT).get2<GetActivityMediaStreamResponse>({
    urlReplacements: { '{activityId}': activityId.toString(), '{fileId}': fileId.toString() },
  });
};

/**
 * Exported ActivityService
 */
const ActivityService = {
  adminCreateActivity,
  adminGetActivity,
  adminListActivities,
  adminUpdateActivity,
  createActivity,
  deleteActivity,
  deleteActivityMedia,
  getActivity,
  getActivityMedia,
  getActivityMediaStream,
  listActivities,
  updateActivity,
  updateActivityMedia,
  uploadActivityMedia,
};

export default ActivityService;
