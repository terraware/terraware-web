import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Variable } from 'src/types/documentProducer/Variable';

import { requestListDeliverableVariables, requestListVariables } from './variablesThunks';

type VariablesState = Record<string, StatusT<Variable[]>>;

const initialVariablesState: VariablesState = {};

const variablesSlice = createSlice({
  name: 'variablesSlice',
  initialState: initialVariablesState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariablesState>) => {
    buildReducers(requestListVariables)(builder);
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

export const documentProducerVariablesReducers = {
  documentProducerVariables: variablesSlice.reducer,
  documentProducerDeliverableVariables: deliverableVariablesSlice.reducer,
};
