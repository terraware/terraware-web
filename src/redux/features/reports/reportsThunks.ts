import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import AcceleratorReportService, { UpdateAcceleratorReportParams } from 'src/services/AcceleratorReportService';
import strings from 'src/strings';
import {
  AcceleratorReportPhoto,
  CreateAcceleratorReportConfigRequest,
  CreateProjectMetricRequest,
  CreateStandardMetricRequestPayload,
  NewAcceleratorReportPhoto,
  PublishAcceleratorReportRequest,
  RefreshAcceleratorReportSystemMetricsRequest,
  ReviewAcceleratorReportMetricRequest,
  ReviewAcceleratorReportRequest,
  UpdateAcceleratorReportConfigRequest,
  UpdateProjectMetricRequest,
  UpdateStandardMetricRequestPayload,
} from 'src/types/AcceleratorReport';
import { UpdateReportMetricTargets } from 'src/types/Report';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import { setProjectReportConfigAction } from './reportsSlice';

export const requestAcceleratorReport = createAsyncThunk(
  'getAcceleratorReport',
  async (
    request: {
      includeMetrics?: boolean;
      projectId: string;
      reportId: string;
    },
    { rejectWithValue }
  ) => {
    const { includeMetrics, projectId, reportId } = request;
    const response = await AcceleratorReportService.getAcceleratorReport(projectId, reportId, includeMetrics);

    if (response && response.requestSucceeded) {
      return response.data?.report;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestSubmitAcceleratorReport = createAsyncThunk(
  'submitAcceleratorReport',
  async (
    request: {
      projectId: string;
      reportId: string;
    },
    { rejectWithValue }
  ) => {
    const { projectId, reportId } = request;

    const response = await AcceleratorReportService.submitAcceleratorReport({ projectId, reportId });

    if (response && response.requestSucceeded) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectReportConfig = (projectId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await AcceleratorReportService.getAcceleratorReportConfig(projectId);
      dispatch(setProjectReportConfigAction({ config: response.config }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // eslint-disable-next-line no-console
      console.error('Error dispatching project report config', e);
    }
  };
};

export const requestCreateReportConfig = createAsyncThunk(
  'createReportConfig',
  async (request: CreateAcceleratorReportConfigRequest, { rejectWithValue }) => {
    const response = await AcceleratorReportService.createConfig(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateReportConfig = createAsyncThunk(
  'updateReportConfig',
  async (request: UpdateAcceleratorReportConfigRequest, { rejectWithValue }) => {
    const response = await AcceleratorReportService.updateConfig(request.config, request.projectId);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListProjectMetrics = createAsyncThunk(
  'listMetrics',
  async (request: { projectId: string }, { rejectWithValue }) => {
    const response = await AcceleratorReportService.listProjectMetrics(request.projectId);

    if (response && response.requestSucceeded) {
      return response.data?.metrics;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListStandardMetrics = createAsyncThunk('listStandardMetrics', async (_, { rejectWithValue }) => {
  const response = await AcceleratorReportService.listStandardMetrics();

  if (response && response.requestSucceeded) {
    return response.data?.metrics;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestListSystemMetrics = createAsyncThunk('listSystemdMetrics', async (_, { rejectWithValue }) => {
  const response = await AcceleratorReportService.listSystemdMetrics();

  if (response && response.requestSucceeded) {
    return response.data?.metrics;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestCreateProjectMetric = createAsyncThunk(
  'createProjectMetric',
  async (request: CreateProjectMetricRequest, { rejectWithValue }) => {
    const response = await AcceleratorReportService.createProjectMetric(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateStandardMetric = createAsyncThunk(
  'createStandardMetric',
  async (request: CreateStandardMetricRequestPayload, { rejectWithValue }) => {
    const response = await AcceleratorReportService.createStandardMetric(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListAcceleratorReports = createAsyncThunk(
  'acceleratorReports/list',
  async (
    request: {
      projectId: string;
      locale?: string;
      search?: SearchNodePayload;
      sortOrder?: SearchSortOrder;
      includeMetrics?: boolean;
      includeFuture?: boolean;
      year?: string;
    },
    { rejectWithValue }
  ) => {
    const { projectId, locale, search, sortOrder, includeMetrics, includeFuture, year } = request;

    const response = await AcceleratorReportService.listAcceleratorReports(
      projectId,
      locale,
      search,
      sortOrder,
      includeMetrics,
      includeFuture,
      year
    );

    if (response && response.requestSucceeded) {
      return response.reports;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateAcceleratorReport = createAsyncThunk(
  'updateProjectMetric',
  async (request: UpdateAcceleratorReportParams, { rejectWithValue }) => {
    const response = await AcceleratorReportService.updateAcceleratorReport(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

type UpdateAcceleratorReportTargetsRequest = {
  payload: UpdateReportMetricTargets;
  projectId: number;
  updateSubmitted?: boolean;
};

export const requestUpdateAcceleratorReportTargets = createAsyncThunk(
  'updateAcceleratorReportTargets',
  async (request: UpdateAcceleratorReportTargetsRequest, { rejectWithValue }) => {
    const { payload, projectId, updateSubmitted } = request;

    const response = await AcceleratorReportService.updateMetricTargets(payload, projectId, updateSubmitted);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateProjectMetric = createAsyncThunk(
  'updateProjectMetric',
  async (request: UpdateProjectMetricRequest, { rejectWithValue }) => {
    const response = await AcceleratorReportService.updateProjectMetric(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateStandardMetric = createAsyncThunk(
  'updateStandardMetric',
  async (request: UpdateStandardMetricRequestPayload, { rejectWithValue }) => {
    const response = await AcceleratorReportService.updateStandardMetric(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestReviewAcceleratorReportMetric = createAsyncThunk(
  'reviewAcceleratorReportMetrics',
  async (request: ReviewAcceleratorReportMetricRequest, { rejectWithValue }) => {
    const { projectId, metric, reportId } = request;

    const response = await AcceleratorReportService.reviewAcceleratorReportMetrics(metric, projectId, reportId);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestReviewAcceleratorReport = createAsyncThunk(
  'reviewAcceleratorReport',
  async (request: ReviewAcceleratorReportRequest, { rejectWithValue }) => {
    const { projectId, review, reportId } = request;

    const response = await AcceleratorReportService.reviewAcceleratorReport(review, projectId, reportId);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestRefreshAcceleratorReportSystemMetrics = createAsyncThunk(
  'refreshAcceleratorReportSystemMetrics',
  async (request: RefreshAcceleratorReportSystemMetricsRequest, { rejectWithValue }) => {
    const { projectId, reportId, metricName } = request;

    const response = await AcceleratorReportService.refreshAcceleratorReportSystemMetrics(
      projectId,
      reportId,
      metricName
    );
    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPublishAcceleratorReport = createAsyncThunk(
  'publishAcceleratorReport',
  async (request: PublishAcceleratorReportRequest, { rejectWithValue }) => {
    const { projectId, reportId } = request;

    const response = await AcceleratorReportService.publishAcceleratorReport(projectId.toString(), reportId.toString());

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteManyAcceleratorReportPhotos = createAsyncThunk(
  'deleteManyAcceleratorReportPhotos',
  async (request: { projectId: string; reportId: string; fileIds: string[] }, { rejectWithValue }) => {
    const promises = request.fileIds.map((fileId) => {
      return AcceleratorReportService.deleteAcceleratorReportPhoto(request.projectId, request.reportId, fileId);
    });

    const responses = await Promise.all(promises);

    if (!responses.every((response) => response.requestSucceeded)) {
      return rejectWithValue(strings.GENERIC_ERROR);
    } else {
      return { status: 'ok' };
    }
  }
);

export const requestUpdateManyAcceleratorReportPhotos = createAsyncThunk(
  'updateManyAcceleratorReportPhotos',
  async (request: { projectId: string; reportId: string; photos: AcceleratorReportPhoto[] }, { rejectWithValue }) => {
    const promises = request.photos.map(({ fileId, caption }) => {
      return AcceleratorReportService.updateAcceleratorReportPhoto(
        request.projectId,
        request.reportId,
        fileId.toString(),
        caption
      );
    });

    const responses = await Promise.all(promises);

    if (!responses.every((response) => response.requestSucceeded)) {
      return rejectWithValue(strings.GENERIC_ERROR);
    } else {
      return { status: 'ok' };
    }
  }
);

export const requestUploadManyAcceleratorReportPhotos = createAsyncThunk(
  'uploadManyAcceleratorReportPhotos',
  async (
    request: { projectId: string; reportId: string; photos: NewAcceleratorReportPhoto[] },
    { rejectWithValue }
  ) => {
    const promises = request.photos.map(({ file, caption }) => {
      return AcceleratorReportService.uploadAcceleratorReportPhoto(request.projectId, request.reportId, caption, file);
    });

    const responses = await Promise.all(promises);

    if (!responses.every((response) => response.requestSucceeded)) {
      return rejectWithValue(strings.GENERIC_ERROR);
    } else {
      return { fileIds: responses.map((response) => response.fileId), status: 'ok' };
    }
  }
);
