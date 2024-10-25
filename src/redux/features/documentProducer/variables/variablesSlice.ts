import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { GetVariableHistoryResponse, Variable, VariableOwners } from 'src/types/documentProducer/Variable';

import {
  requestGetVariableHistory,
  requestListAllVariables,
  requestListDeliverableVariables,
  requestListDocumentVariables,
  requestListSpecificVariables,
  requestListVariablesOwners,
  requestUpdateVariableOwner,
  requestUpdateVariableWorkflowDetails,
} from './variablesThunks';

type SpecificVariablesProjectIdArg = { variablesStableIds: string[]; projectId: number };

export const specificVariablesCompositeKeyFn = (arg: unknown): string => {
  const castArg = arg as SpecificVariablesProjectIdArg;
  if (!(castArg.variablesStableIds && castArg.projectId && castArg.variablesStableIds.length > 0)) {
    return '';
  }

  return `v${castArg.variablesStableIds.toString()}-p${castArg.projectId}`;
};

type VariablesState = Record<string, StatusT<Variable[]>>;

const initialVariablesState: VariablesState = {};

const allVariablesSlice = createSlice({
  name: 'allVariablesSlice',
  initialState: initialVariablesState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesState>) => {
    buildReducers(requestListAllVariables, true, () => 'all')(builder);
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

const specificVariablesSlice = createSlice({
  name: 'specificVariablesSlice',
  initialState: initialVariablesState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesState>) => {
    buildReducers(requestListSpecificVariables, true)(builder);
  },
});

const documentVariablesSlice = createSlice({
  name: 'documentVariablesSlice',
  initialState: initialVariablesState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesState>) => {
    buildReducers(requestListDocumentVariables, true)(builder);
  },
});

export const variableHistoryCompositeKeyFn = (arg: unknown): string => {
  const castArg = arg as { projectId: number; variableId: number };

  return `v${castArg.variableId.toString()}-p${castArg.projectId}`;
};

/**
 * Variable History
 */
const initialVariablesHistoryState: Record<string, StatusT<GetVariableHistoryResponse>> = {};

const variableHistorySlice = createSlice({
  name: 'variableHistorySlice',
  initialState: initialVariablesHistoryState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetVariableHistory, true, variableHistoryCompositeKeyFn)(builder);
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

type VariablesOwnersState = Record<string, StatusT<VariableOwners[]>>;

const initialVariablesOwnersState: VariablesOwnersState = {};

const variablesOwnersSlice = createSlice({
  name: 'variablesOwnersSlice',
  initialState: initialVariablesOwnersState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesOwnersState>) => {
    buildReducers(requestListVariablesOwners, true)(builder);
  },
});

export const documentProducerVariablesReducers = {
  documentProducerAllVariables: allVariablesSlice.reducer,
  documentProducerDeliverableVariables: deliverableVariablesSlice.reducer,
  documentProducerDocumentVariables: documentVariablesSlice.reducer,
  variableHistory: variableHistorySlice.reducer,
  variableWorkflowDetailsUpdate: variableWorkflowDetailsUpdateSlice.reducer,
  variableOwnerUpdate: variableOwnerUpdateSlice.reducer,
  variablesOwners: variablesOwnersSlice.reducer,
  documentProducerSpecificVariables: specificVariablesSlice.reducer,
};
