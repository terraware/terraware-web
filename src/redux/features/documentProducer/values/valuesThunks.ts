import { createAsyncThunk } from '@reduxjs/toolkit';

import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
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

export const requestListSpecificVariablesValues = createAsyncThunk(
  'listSpecificVariablesValues',
  async (params: { projectId: number; variablesStableIds: string[] }, { rejectWithValue }) => {
    const response: Response2<VariableValuesListResponse> = await ValueService.getSpecificValues(params);

    if (response.requestSucceeded && response.data?.values) {
      return response.data.values;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

const valueWriteTags = (projectId: number) => [
  { type: QueryTagTypes.VariableValues, id: projectId },
  QueryTagTypes.VariableWorkflowHistory,
  QueryTagTypes.Deliverables,
  QueryTagTypes.ApplicationDeliverables,
  QueryTagTypes.ApplicationModules,
];

export const requestUpdateVariableValues = createAsyncThunk(
  'updateVariableValues',
  async (
    { operations, projectId, updateStatuses }: UpdateVariableValuesRequestWithProjectId,
    { dispatch, rejectWithValue }
  ) => {
    const response = await ValueService.updateValue(projectId, operations, updateStatuses);
    if (response.requestSucceeded) {
      dispatch(baseApi.util.invalidateTags(valueWriteTags(projectId)));
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateSectionVariableValues = createAsyncThunk(
  'updateVariableValues',
  async (
    { variableId, values, projectId }: ReplaceSectionValuesOperationPayloadWithProjectId,
    { dispatch, rejectWithValue }
  ) => {
    const response = await ValueService.updateValue(projectId, [{ operation: 'Replace', variableId, values }]);
    if (response.requestSucceeded) {
      dispatch(baseApi.util.invalidateTags(valueWriteTags(projectId)));
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUploadImageValue = createAsyncThunk(
  'uploadImageValue',
  async (
    { variableId, file, caption, citation, projectId }: UploadImageValueRequestPayloadWithProjectId,
    { dispatch, rejectWithValue }
  ) => {
    const response = await ValueService.uploadImageValue(projectId, variableId, file, citation, caption);
    if (response.requestSucceeded) {
      dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.VariableValues, id: projectId }]));
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUploadManyImageValues = createAsyncThunk(
  'uploadManyImageValues',
  async (imageValues: UploadImageValueRequestPayloadWithProjectId[], { dispatch, rejectWithValue }) => {
    let allSucceeded = true;

    const promises = imageValues.map((imageValue) =>
      ValueService.uploadImageValue(
        imageValue.projectId,
        imageValue.variableId,
        imageValue.file,
        imageValue.citation,
        imageValue.caption
      )
    );

    const results = await Promise.all(promises);
    dispatch(
      baseApi.util.invalidateTags(
        imageValues.map((imageValue) => ({ type: QueryTagTypes.VariableValues, id: imageValue.projectId }))
      )
    );

    results.forEach((res) => {
      if (!res.requestSucceeded) {
        allSucceeded = false;
      }
    });

    if (allSucceeded) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
