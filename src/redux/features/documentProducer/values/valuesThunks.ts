import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ValueService from 'src/services/documentProducer/ValueService';
import strings from 'src/strings';
import {
  ReplaceSectionValuesOperationPayloadWithProjectId,
  UpdateVariableValuesRequestWithProjectId,
  UploadImageValueRequestPayloadWithProjectId,
  VariableValuesListResponse,
} from 'src/types/documentProducer/VariableValue';

export const requestListDeliverableVariablesValues = createAsyncThunk(
  'listDeliverableVariablesValues',
  async (params: { deliverableId: number; projectId: number }, { rejectWithValue }) => {
    const response: Response2<VariableValuesListResponse> = await ValueService.getDeliverableValues(params);
    if (response.requestSucceeded && response.data?.values) {
      return response.data.values;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestListVariablesValues = createAsyncThunk(
  'listVariablesValues',
  async ({ projectId, maxValueId }: { projectId: number; maxValueId?: number }, { rejectWithValue }) => {
    const response: Response2<VariableValuesListResponse> = await ValueService.getValues(projectId, maxValueId);
    if (response.requestSucceeded && response.data?.values) {
      return response.data.values;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateVariableValues = createAsyncThunk(
  'updateVariableValues',
  async ({ operations, projectId }: UpdateVariableValuesRequestWithProjectId, { rejectWithValue }) => {
    const response = await ValueService.updateValue(projectId, operations);
    if (response.requestSucceeded) {
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateSectionVariableValues = createAsyncThunk(
  'updateVariableValues',
  async ({ variableId, values, projectId }: ReplaceSectionValuesOperationPayloadWithProjectId, { rejectWithValue }) => {
    const response = await ValueService.updateValue(projectId, [{ operation: 'Replace', variableId, values }]);
    if (response.requestSucceeded) {
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUploadImageValue = createAsyncThunk(
  'uploadImageValue',
  async (
    { variableId, file, caption, citation, projectId }: UploadImageValueRequestPayloadWithProjectId,
    { rejectWithValue }
  ) => {
    const response = await ValueService.uploadImageValue(projectId, variableId, file, citation, caption);
    if (response.requestSucceeded) {
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
