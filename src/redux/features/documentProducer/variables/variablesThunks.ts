import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import VariableService from 'src/services/documentProducer/VariableService';
import strings from 'src/strings';
import { UpdateVariableWorkflowDetailsPayload, VariableListResponse } from 'src/types/documentProducer/Variable';

export const requestListAllVariables = createAsyncThunk('listAllVariables', async (_, { rejectWithValue }) => {
  const response: Response2<VariableListResponse> = await VariableService.getAllVariables();
  if (response && response.requestSucceeded && response.data) {
    return response.data.variables;
  }

  return rejectWithValue(response.error || strings.GENERIC_ERROR);
});

export const requestListDeliverableVariables = createAsyncThunk(
  'listDeliverableVariables',
  async (deliverableId: number, { rejectWithValue }) => {
    const response: Response2<VariableListResponse> = await VariableService.getDeliverableVariables(deliverableId);
    if (response && response.requestSucceeded && response.data) {
      return response.data.variables;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestListVariables = createAsyncThunk(
  'listVariables',
  async (manifestId: number, { rejectWithValue }) => {
    const response: Response2<VariableListResponse> = await VariableService.getVariables(manifestId);
    if (response && response.requestSucceeded && response.data) {
      return response.data.variables;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateVariableWorkflowDetails = createAsyncThunk(
  'updateVariableWorkflowDetails',
  async (
    {
      projectId,
      variableId,
      ...rest
    }: UpdateVariableWorkflowDetailsPayload & { projectId: number; variableId: number },
    { rejectWithValue }
  ) => {
    const response = await VariableService.updateVariableWorkflowDetails(variableId, projectId, rest);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
