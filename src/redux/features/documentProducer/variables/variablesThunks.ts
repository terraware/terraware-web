import { createAsyncThunk } from '@reduxjs/toolkit';

import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
import VariableService from 'src/services/documentProducer/VariableService';
import strings from 'src/strings';
import { UpdateVariableOwnerPayload, UpdateVariableWorkflowDetailsPayload } from 'src/types/documentProducer/Variable';

export const requestUpdateVariableWorkflowDetails = createAsyncThunk(
  'updateVariableWorkflowDetails',
  async (
    {
      projectId,
      variableId,
      ...rest
    }: UpdateVariableWorkflowDetailsPayload & { projectId: number; variableId: number },
    { dispatch, rejectWithValue }
  ) => {
    const response = await VariableService.updateVariableWorkflowDetails(variableId, projectId, rest);
    if (response.requestSucceeded) {
      dispatch(
        baseApi.util.invalidateTags([
          { type: QueryTagTypes.VariableValues, id: projectId },
          { type: QueryTagTypes.VariableWorkflowHistory, id: `p${projectId}-v${variableId}` },
          QueryTagTypes.Deliverables,
          QueryTagTypes.ApplicationDeliverables,
          QueryTagTypes.ApplicationModules,
        ])
      );
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestUpdateVariableOwner = createAsyncThunk(
  'updateVariableOwner',
  async (
    { projectId, variableId, ...rest }: UpdateVariableOwnerPayload & { projectId: number; variableId: number },
    { dispatch, rejectWithValue }
  ) => {
    const response = await VariableService.updateVariableOwner(variableId, projectId, rest);
    if (response.requestSucceeded) {
      dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.VariableOwners, id: projectId }]));
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
