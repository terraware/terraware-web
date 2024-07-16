import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Variable } from 'src/types/documentProducer/Variable';

import {
  requestListDeliverableVariables,
  requestListVariables,
  requestUpdateVariableWorkflowDetails,
} from './variablesThunks';

type VariablesState = Record<string, StatusT<Variable[]>>;

const initialVariablesState: VariablesState = {};

const variablesSlice = createSlice({
  name: 'variablesSlice',
  initialState: initialVariablesState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesState>) => {
    buildReducers(requestListVariables, true)(builder);
  },
});

const deliverableVariablesSlice = createSlice({
  name: 'deliverableVariablesSlice',
  initialState: initialVariablesState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesState>) => {
    buildReducers(requestListDeliverableVariables, true)(builder);
  },
});

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

export const documentProducerVariablesReducers = {
  documentProducerVariables: variablesSlice.reducer,
  documentProducerDeliverableVariables: deliverableVariablesSlice.reducer,
  variableWorkflowDetailsUpdate: variableWorkflowDetailsUpdateSlice.reducer,
};
