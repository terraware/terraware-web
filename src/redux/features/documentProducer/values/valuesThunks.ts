import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ValueService from 'src/services/documentProducer/ValueService';
import strings from 'src/strings';
import {
  ReplaceSectionValuesOperationPayload,
  UpdateVariableValuesRequestWithDocId,
  UploadImageValueRequestPayloadWithDocId,
  VariableValuesListResponse,
} from 'src/types/documentProducer/VariableValue';

export const requestListVariablesValues = createAsyncThunk(
  'listVariablesValues',
  async (docId: number, { rejectWithValue }) => {
    const response: Response2<VariableValuesListResponse> = await ValueService.getValues(docId);
    if (response.requestSucceeded && response.data?.values) {
      return response.data.values;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateVariableValues = createAsyncThunk(
  'updateVariableValues',
  async ({ operations, docId }: UpdateVariableValuesRequestWithDocId, { rejectWithValue }) => {
    const response = await ValueService.updateValue(docId, operations);
    if (response.requestSucceeded) {
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateSectionVariableValues = createAsyncThunk(
  'updateVariableValues',
  async ({ variableId, values, docId }: ReplaceSectionValuesOperationPayload, { rejectWithValue }) => {
    const response = await ValueService.updateValue(docId, [{ operation: 'Replace', variableId, values }]);
    if (response.requestSucceeded) {
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUploadImageValue = createAsyncThunk(
  'uploadImageValue',
  async (
    { variableId, file, caption, citation, docId }: UploadImageValueRequestPayloadWithDocId,
    { rejectWithValue }
  ) => {
    const response = await ValueService.uploadImageValue(docId, variableId, file, citation, caption);
    if (response.requestSucceeded) {
      return Boolean(true);
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
