import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import AcceleratorReportService from 'src/services/AcceleratorReportService';
import strings from 'src/strings';
import {
  CreateAcceleratorReportConfigRequest,
  CreateProjectMetricRequest,
  ReviewAcceleratorReportMetricRequest,
  ReviewAcceleratorReportMetricsRequest,
  ReviewManyAcceleratorReportMetricsRequest,
  UpdateAcceleratorReportConfigRequest,
  UpdateProjectMetricRequest,
} from 'src/types/AcceleratorReport';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import { setProjectReportConfigAction } from './reportsSlice';

export const requestProjectReportConfig = (projectId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await AcceleratorReportService.getAcceleratorReportConfig(projectId);
      dispatch(setProjectReportConfigAction({ config: response.config }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
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
    const response = await AcceleratorReportService.updateConfig(request);

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

export const requestReviewManyAcceleratorReportMetrics = createAsyncThunk(
  'reviewAcceleratorReportMetrics',
  async (request: ReviewManyAcceleratorReportMetricsRequest, { rejectWithValue }) => {
    const { projectId, requests } = request;

    const promises = requests.map((iRequest: ReviewAcceleratorReportMetricsRequest) => {
      const { reportId, ...rest } = iRequest;
      return AcceleratorReportService.reviewAcceleratorReportMetrics(rest, projectId, reportId);
    });

    const results = await Promise.all(promises);

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
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
