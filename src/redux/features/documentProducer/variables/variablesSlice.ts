import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';

import { requestUpdateVariableOwner, requestUpdateVariableWorkflowDetails } from './variablesThunks';

/**
 * Variable Values Update
 */
type VariableWorkflowDetailsUpdateState = Record<string, StatusT<number>>;

const initialVariableWorkflowDetailsUpdateSlice: VariableWorkflowDetailsUpdateState = {};

const variableWorkflowDetailsUpdateSlice = createSlice({
  name: 'variableWorkflowDetailsUpdateSlice',
  initialState: initialVariableWorkflowDetailsUpdateSlice,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableWorkflowDetailsUpdateState>) => {
    buildReducers(requestUpdateVariableWorkflowDetails)(builder);
  },
});

/**
 * Variable Owner Update
 */
type VariableOwnerUpdateState = Record<string, StatusT<number>>;

const initialVariableOwnerUpdateSlice: VariableOwnerUpdateState = {};

const variableOwnerUpdateSlice = createSlice({
  name: 'variableOwnerUpdateSlice',
  initialState: initialVariableOwnerUpdateSlice,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableOwnerUpdateState>) => {
    buildReducers(requestUpdateVariableOwner)(builder);
  },
});

export const documentProducerVariablesReducers = {
  variableWorkflowDetailsUpdate: variableWorkflowDetailsUpdateSlice.reducer,
  variableOwnerUpdate: variableOwnerUpdateSlice.reducer,
};
