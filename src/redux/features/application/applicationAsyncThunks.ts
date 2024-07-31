import { createAsyncThunk } from '@reduxjs/toolkit';

import ApplicationService from 'src/services/ApplicationService';
import strings from 'src/strings';
import { ApplicationReview } from 'src/types/Application';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { MultiPolygon, Polygon } from 'src/types/Tracking';

export const requestCreateApplication = createAsyncThunk(
  'applications/create',
  async (request: { projectId: number }, { rejectWithValue }) => {
    const { projectId } = request;

    const response = await ApplicationService.createApplication(projectId);

    if (response.requestSucceeded && response.data) {
      return response.data.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateProjectApplication = createAsyncThunk(
  'applications/createProject',
  async (request: { projectName: string; organizationId: number }, { rejectWithValue }) => {
    const { projectName, organizationId } = request;

    const response = await ApplicationService.createProjectApplication(projectName, organizationId);

    if (response.requestSucceeded && response.data) {
      return response.data.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListApplications = createAsyncThunk(
  'applications/list',
  async (
    request: {
      organizationId?: number;
      listAll?: boolean;
      locale?: string;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const response = await ApplicationService.listApplications(request);

    if (response && response.requestSucceeded) {
      return response.data?.applications ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListApplicationDeliverables = createAsyncThunk(
  'applications/listDeliverables',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.listApplicationDeliverables(applicationId);

    if (response && response.requestSucceeded) {
      return response.data?.deliverables ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListApplicationHistory = createAsyncThunk(
  'applications/listHistory',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.listApplicationHistory(applicationId);

    if (response && response.requestSucceeded) {
      return response.data?.history ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListApplicationModules = createAsyncThunk(
  'applications/listModules',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.listApplicationModules(applicationId);

    if (response && response.requestSucceeded) {
      return response.data?.modules ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestRestartApplication = createAsyncThunk(
  'applications/restart',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.restartApplication(applicationId);

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestSubmitApplication = createAsyncThunk(
  'applications/submit',
  async (request: { applicationId: number }, { rejectWithValue }) => {
    const { applicationId } = request;

    const response = await ApplicationService.submitApplication(applicationId);

    if (response && response.requestSucceeded) {
      return response.data?.problems;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestReviewApplication = createAsyncThunk(
  'applications/review',
  async (request: { applicationId: number; review: ApplicationReview }, { rejectWithValue }) => {
    const { applicationId, review } = request;

    const response = await ApplicationService.reviewApplication(applicationId, review);

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateApplicationBoundary = createAsyncThunk(
  'applications/updateBoundary',
  async (request: { applicationId: number; boundary: MultiPolygon | Polygon }, { rejectWithValue }) => {
    const { applicationId, boundary } = request;

    const response = await ApplicationService.updateBoundary(applicationId, { boundary });

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUploadApplicationBoundary = createAsyncThunk(
  'applications/uploadBoundary',
  async (request: { applicationId: number; file: File }, { rejectWithValue }) => {
    const { applicationId, file } = request;

    const response = await ApplicationService.uploadBoundary(applicationId, file);

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
