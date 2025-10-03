import { createAsyncThunk } from '@reduxjs/toolkit';

import { ActivityMediaItem } from 'src/components/ActivityLog/ActivityMediaForm';
import ActivityService from 'src/services/ActivityService';
import FileService from 'src/services/FileService';
import strings from 'src/strings';
import {
  ActivityMediaFile,
  ActivityPayload,
  AdminActivityPayload,
  AdminCreateActivityRequestPayload,
  CreateActivityRequestPayload,
} from 'src/types/Activity';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

type SyncActivityMediaResult = {
  error?: string;
  fileId?: number;
  operation: 'delete' | 'update' | 'upload';
  success: boolean;
};

type SyncActivityMediaResponse = {
  allSuccessful: boolean;
  deletedCount: number;
  results: SyncActivityMediaResult[];
  updatedCount: number;
  uploadedCount: number;
};

export const requestListActivities = createAsyncThunk(
  'activities/list',
  async (
    request: {
      projectId: number;
      includeMedia?: boolean;
      locale?: string;
      search?: SearchNodePayload;
      sortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { projectId, includeMedia, locale, search, sortOrder } = request;

    const response = await ActivityService.listActivities(projectId, includeMedia, locale, search, sortOrder);

    if (response?.requestSucceeded && response?.data) {
      return response.data.activities ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateActivity = createAsyncThunk(
  'activities/create',
  async (activity: CreateActivityRequestPayload, { rejectWithValue }) => {
    const response = await ActivityService.createActivity(activity);

    if (response?.requestSucceeded && response?.data) {
      return response.data.activity;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAdminListActivities = createAsyncThunk(
  'activities/adminList',
  async (
    request: {
      projectId: number;
      includeMedia?: boolean;
      locale?: string;
      search?: SearchNodePayload;
      sortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { projectId, includeMedia, locale, search, sortOrder } = request;

    const response = await ActivityService.adminListActivities(projectId, includeMedia, locale, search, sortOrder);

    if (response?.requestSucceeded && response?.data) {
      return response.data.activities ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAdminGetActivity = createAsyncThunk(
  'activities/adminGet',
  async (activityId: number, { rejectWithValue }) => {
    const response = await ActivityService.adminGetActivity(activityId);

    if (response?.requestSucceeded && response?.data) {
      return response.data.activity;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAdminUpdateActivity = createAsyncThunk(
  'activities/adminUpdate',
  async (request: { activityId: number; activity: AdminActivityPayload }, { rejectWithValue }) => {
    const { activityId, activity } = request;

    const response = await ActivityService.adminUpdateActivity(activityId, activity);

    if (response?.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestAdminCreateActivity = createAsyncThunk(
  'activities/adminCreate',
  async (activity: AdminCreateActivityRequestPayload, { rejectWithValue }) => {
    const response = await ActivityService.adminCreateActivity(activity);

    if (response?.requestSucceeded && response?.data) {
      return response.data.activity;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetActivity = createAsyncThunk(
  'activities/get',
  async (activityId: number, { rejectWithValue }) => {
    const response = await ActivityService.getActivity(activityId);

    if (response?.requestSucceeded && response?.data) {
      return response.data.activity;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateActivity = createAsyncThunk(
  'activities/update',
  async (request: { activityId: number; activity: ActivityPayload }, { rejectWithValue }) => {
    const { activityId, activity } = request;

    const response = await ActivityService.updateActivity(activityId, activity);

    if (response?.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteActivity = createAsyncThunk(
  'activities/delete',
  async (activityId: number, { rejectWithValue }) => {
    const response = await ActivityService.deleteActivity(activityId);

    if (response?.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUploadActivityMedia = createAsyncThunk(
  'activities/uploadMedia',
  async (request: { activityId: number; mediaData: FormData }, { rejectWithValue }) => {
    const { activityId, mediaData } = request;

    const response = await ActivityService.uploadActivityMedia(activityId, mediaData);

    if (response?.requestSucceeded && response?.data) {
      return { fileId: response.data.fileId };
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetActivityMedia = createAsyncThunk(
  'activities/getMedia',
  async (
    request: {
      activityId: number;
      fileId: number;
      maxWidth?: number;
      maxHeight?: number;
    },
    { rejectWithValue }
  ) => {
    const { activityId, fileId, maxWidth, maxHeight } = request;

    const response = await ActivityService.getActivityMedia(activityId, fileId, maxWidth, maxHeight);

    if (response?.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateActivityMedia = createAsyncThunk(
  'activities/updateMedia',
  async (
    request: {
      activityId: number;
      fileId: number;
      mediaData: ActivityMediaFile;
    },
    { rejectWithValue }
  ) => {
    const { activityId, fileId, mediaData } = request;

    const response = await ActivityService.updateActivityMedia(activityId, fileId, mediaData);

    if (response?.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteActivityMedia = createAsyncThunk(
  'activities/deleteMedia',
  async (request: { activityId: number; fileId: number }, { rejectWithValue }) => {
    const { activityId, fileId } = request;

    const response = await ActivityService.deleteActivityMedia(activityId, fileId);

    if (response?.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetFileForToken = createAsyncThunk(
  'activities/getFileForToken',
  async (token: string, { rejectWithValue }) => {
    const response = await FileService.getFileForToken(token);

    if (response?.requestSucceeded && response?.data) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestSyncActivityMedia = createAsyncThunk(
  'activities/syncMedia',
  async (request: { activityId: number; mediaItems: ActivityMediaItem[] }, { rejectWithValue }) => {
    const { activityId, mediaItems } = request;
    const results: SyncActivityMediaResult[] = [];

    // delete existing media items marked for deletion
    const itemsToDelete = mediaItems.filter((item) => item.type === 'existing' && item.isDeleted);

    for (const item of itemsToDelete) {
      if (item.type === 'existing') {
        try {
          const deleteResponse = await ActivityService.deleteActivityMedia(activityId, item.data.fileId);

          results.push({
            ...(deleteResponse?.requestSucceeded ? {} : { error: 'Delete request failed' }),
            fileId: item.data.fileId,
            operation: 'delete',
            success: !!deleteResponse?.requestSucceeded,
          });
        } catch (error) {
          results.push({
            error: error instanceof Error ? error.message : 'Unknown delete error',
            fileId: item.data.fileId,
            operation: 'delete',
            success: false,
          });
        }
      }
    }

    // update metadata of existing media items marked as modified
    const itemsToUpdate = mediaItems.filter((item) => item.type === 'existing' && item.isModified && !item.isDeleted);

    for (const item of itemsToUpdate) {
      if (item.type === 'existing') {
        try {
          const updateResponse = await ActivityService.updateActivityMedia(activityId, item.data.fileId, {
            caption: item.data.caption,
            isCoverPhoto: item.data.isCoverPhoto,
            isHiddenOnMap: item.data.isHiddenOnMap,
            listPosition: item.data.listPosition,
          });

          results.push({
            ...(updateResponse?.requestSucceeded ? {} : { error: 'Update request failed' }),
            fileId: item.data.fileId,
            operation: 'update',
            success: !!updateResponse?.requestSucceeded,
          });
        } catch (error) {
          results.push({
            error: error instanceof Error ? error.message : 'Unknown update error',
            fileId: item.data.fileId,
            operation: 'update',
            success: false,
          });
        }
      }
    }

    // upload new media files and update their metadata
    const itemsToUpload = mediaItems.filter((item) => item.type === 'new');

    for (const item of itemsToUpload) {
      if (item.type === 'new') {
        try {
          // upload the file
          const formData = new FormData();
          formData.append('file', item.data.file);
          const uploadResponse = await ActivityService.uploadActivityMedia(activityId, formData);

          if (!uploadResponse?.requestSucceeded || !uploadResponse?.data?.fileId) {
            results.push({
              error: 'File upload failed',
              operation: 'upload',
              success: false,
            });
            continue;
          }

          // update the metadata
          const updateResponse = await ActivityService.updateActivityMedia(activityId, uploadResponse.data.fileId, {
            caption: item.data.caption,
            isCoverPhoto: item.data.isCoverPhoto,
            isHiddenOnMap: item.data.isHiddenOnMap,
            listPosition: item.data.listPosition,
          });

          if (!updateResponse?.requestSucceeded) {
            results.push({
              error: 'Metadata update failed after upload',
              fileId: uploadResponse.data.fileId,
              operation: 'upload',
              success: false,
            });
            continue;
          }

          results.push({
            fileId: uploadResponse.data.fileId,
            operation: 'upload',
            success: true,
          });
        } catch (error) {
          results.push({
            error: error instanceof Error ? error.message : 'Unknown upload error',
            operation: 'upload',
            success: false,
          });
        }
      }
    }

    const response: SyncActivityMediaResponse = {
      allSuccessful: results.every((result) => result.success),
      deletedCount: results.filter((r) => r.success && r.operation === 'delete').length,
      results,
      updatedCount: results.filter((r) => r.success && r.operation === 'update').length,
      uploadedCount: results.filter((r) => r.success && r.operation === 'upload').length,
    };

    if (response.allSuccessful) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
