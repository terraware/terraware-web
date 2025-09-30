import { createAsyncThunk } from '@reduxjs/toolkit';

import { ActivityMediaPhoto } from 'src/components/ActivityLog/ActivityMediaForm';
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

type UploadManyActivityMediaResult = {
  success: boolean;
  fileId?: number;
  error?: string;
};

type UploadManyActivityMediaResponse = {
  results: UploadManyActivityMediaResult[];
  allSuccessful: boolean;
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
  async (activityId: string, { rejectWithValue }) => {
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

export const requestUploadManyActivityMedia = createAsyncThunk(
  'activities/uploadManyMedia',
  async (request: { activityId: number; mediaFiles: ActivityMediaPhoto[] }, { rejectWithValue }) => {
    const { activityId, mediaFiles } = request;

    const results = [];

    for (const mediaFile of mediaFiles) {
      try {
        // Upload the file
        const formData = new FormData();
        formData.append('file', mediaFile.file);
        const uploadResponse = await ActivityService.uploadActivityMedia(activityId, formData);

        if (!uploadResponse?.requestSucceeded || !uploadResponse?.data?.fileId) {
          results.push({
            success: false,
            error: 'Upload failed',
          });
          continue;
        }

        // Update the metadata
        const updateResponse = await ActivityService.updateActivityMedia(activityId, uploadResponse.data.fileId, {
          caption: mediaFile.caption,
          isCoverPhoto: !!mediaFile.isCoverPhoto,
        });

        if (!updateResponse?.requestSucceeded) {
          results.push({
            success: false,
            fileId: uploadResponse.data.fileId,
            error: 'Metadata update failed',
          });
          continue;
        }

        results.push({
          success: true,
          fileId: uploadResponse.data.fileId,
        });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }

    const response: UploadManyActivityMediaResponse = {
      results,
      allSuccessful: results.every((result) => result.success),
    };

    if (response.allSuccessful) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
