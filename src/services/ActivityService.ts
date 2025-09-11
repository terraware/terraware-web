import { paths } from 'src/api/types/generated-schema';
import { ActivityMediaFile, ActivityPayload, AdminActivityPayload } from 'src/types/Activity';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

import HttpService, { Response, Response2 } from './HttpService';

const ACTIVITIES_ENDPOINT = '/api/v1/accelerator/activities';
const ACTIVITIES_ADMIN_ENDPOINT = '/api/v1/accelerator/activities/admin';
const ACTIVITY_ADMIN_ENDPOINT = '/api/v1/accelerator/activities/admin/{id}';
const ACTIVITY_ENDPOINT = '/api/v1/accelerator/activities/{activityId}';
const ACTIVITY_MEDIA_ENDPOINT = '/api/v1/accelerator/activities/{activityId}/media';
const ACTIVITY_MEDIA_FILE_ENDPOINT = '/api/v1/accelerator/activities/{activityId}/media/{fileId}';

type ListActivitiesResponse = paths[typeof ACTIVITIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type CreateActivityResponse =
  paths[typeof ACTIVITIES_ENDPOINT]['post']['responses'][200]['content']['application/json'];
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
type UpdateActivityMediaResponse =
  paths[typeof ACTIVITY_MEDIA_FILE_ENDPOINT]['put']['responses'][200]['content']['application/json'];
type DeleteActivityMediaResponse =
  paths[typeof ACTIVITY_MEDIA_FILE_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

type ListActivitiesParams = paths[typeof ACTIVITIES_ENDPOINT]['get']['parameters']['query'];
type AdminListActivitiesParams = paths[typeof ACTIVITIES_ADMIN_ENDPOINT]['get']['parameters']['query'];
type GetActivityMediaParams = paths[typeof ACTIVITY_MEDIA_FILE_ENDPOINT]['get']['parameters']['query'];

export type ActivitiesData = {
  activities?: ActivityPayload[];
};

export type AdminActivitiesData = {
  activities?: AdminActivityPayload[];
};

export type ActivitiesResponse = Response & ActivitiesData;
export type AdminActivitiesResponse = Response & AdminActivitiesData;

/**
 * List all activities for a project
 */
const listActivities = async (
  params?: ListActivitiesParams,
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ActivitiesResponse> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }

  const queryParams = params
    ? {
        ...(params.projectId !== undefined && { projectId: params.projectId.toString() }),
        ...(params.includeMedia !== undefined && { includeMedia: params.includeMedia.toString() }),
      }
    : undefined;

  return await HttpService.root(ACTIVITIES_ENDPOINT).get<ListActivitiesResponse, ActivitiesData>(
    { params: queryParams },
    (data) => ({
      activities: searchAndSort(data?.activities || [], search, searchOrderConfig),
    })
  );
};

/**
 * Create a new activity
 */
const createActivity = async (activity: ActivityPayload): Promise<Response2<CreateActivityResponse>> => {
  return HttpService.root(ACTIVITIES_ENDPOINT).post2<CreateActivityResponse>({
    entity: activity,
  });
};

/**
 * List all activities for a project with admin details
 */
const adminListActivities = async (
  params?: AdminListActivitiesParams,
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<AdminActivitiesResponse> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }

  const queryParams = params
    ? {
        ...(params.projectId !== undefined && { projectId: params.projectId.toString() }),
      }
    : undefined;

  return await HttpService.root(ACTIVITIES_ADMIN_ENDPOINT).get<AdminListActivitiesResponse, AdminActivitiesData>(
    { params: queryParams },
    (data) => ({
      activities: searchAndSort(data?.activities || [], search, searchOrderConfig),
    })
  );
};

/**
 * Get a single activity with admin details
 */
const adminGetActivity = async (activityId: string): Promise<Response2<AdminGetActivityResponse>> => {
  return HttpService.root(ACTIVITY_ADMIN_ENDPOINT.replace('{id}', activityId)).get2<AdminGetActivityResponse>();
};

/**
 * Update an activity with admin details
 */
const adminUpdateActivity = async (
  activityId: string,
  activity: AdminActivityPayload
): Promise<Response2<AdminUpdateActivityResponse>> => {
  return HttpService.root(ACTIVITY_ADMIN_ENDPOINT.replace('{id}', activityId)).put2<AdminUpdateActivityResponse>({
    entity: activity,
  });
};

/**
 * Get a single activity
 */
const getActivity = async (activityId: string): Promise<Response2<GetActivityResponse>> => {
  return HttpService.root(ACTIVITY_ENDPOINT.replace('{activityId}', activityId)).get2<GetActivityResponse>();
};

/**
 * Update an activity
 */
const updateActivity = async (
  activityId: string,
  activity: ActivityPayload
): Promise<Response2<UpdateActivityResponse>> => {
  return HttpService.root(ACTIVITY_ENDPOINT.replace('{activityId}', activityId)).put2<UpdateActivityResponse>({
    entity: activity,
  });
};

/**
 * Delete an activity
 */
const deleteActivity = async (activityId: string): Promise<Response2<DeleteActivityResponse>> => {
  return HttpService.root(ACTIVITY_ENDPOINT.replace('{activityId}', activityId)).delete2<DeleteActivityResponse>();
};

/**
 * Upload media for an activity
 */
const uploadActivityMedia = async (
  activityId: string,
  mediaData: FormData
): Promise<Response2<UploadActivityMediaResponse>> => {
  return HttpService.root(
    ACTIVITY_MEDIA_ENDPOINT.replace('{activityId}', activityId)
  ).post2<UploadActivityMediaResponse>({
    entity: mediaData,
  });
};

/**
 * Get activity media file
 */
const getActivityMedia = async (
  activityId: string,
  fileId: string,
  params?: GetActivityMediaParams
): Promise<Response2<any>> => {
  const queryParams = params
    ? {
        ...(params.maxWidth !== undefined && { maxWidth: params.maxWidth.toString() }),
        ...(params.maxHeight !== undefined && { maxHeight: params.maxHeight.toString() }),
      }
    : undefined;

  return HttpService.root(
    ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activityId).replace('{fileId}', fileId)
  ).get2<any>({
    params: queryParams,
  });
};

/**
 * Update activity media file information
 */
const updateActivityMedia = async (
  activityId: string,
  fileId: string,
  mediaData: ActivityMediaFile
): Promise<Response2<UpdateActivityMediaResponse>> => {
  return HttpService.root(
    ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activityId).replace('{fileId}', fileId)
  ).put2<UpdateActivityMediaResponse>({
    entity: mediaData,
  });
};

/**
 * Delete activity media file
 */
const deleteActivityMedia = async (
  activityId: string,
  fileId: string
): Promise<Response2<DeleteActivityMediaResponse>> => {
  return HttpService.root(
    ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activityId).replace('{fileId}', fileId)
  ).delete2<DeleteActivityMediaResponse>();
};

/**
 * Exported ActivityService
 */
const ActivityService = {
  adminGetActivity,
  adminListActivities,
  adminUpdateActivity,
  createActivity,
  deleteActivity,
  deleteActivityMedia,
  getActivity,
  getActivityMedia,
  listActivities,
  updateActivity,
  updateActivityMedia,
  uploadActivityMedia,
};

export default ActivityService;
