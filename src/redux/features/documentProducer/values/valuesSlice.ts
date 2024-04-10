import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import { requestListVariablesValues, requestUpdateVariableValues, requestUploadImageValue } from './valuesThunks';

/**
 * Variable Values List
 */
type VariableValuesListState = Record<string, StatusT<VariableValue[]>>;

const initialVariableValuesListState: VariableValuesListState = {};

const variableValuesListSlice = createSlice({
  name: 'variableValuesListSlice',
  initialState: initialVariableValuesListState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableValuesListState>) => {
    buildReducers(requestListVariablesValues, true)(builder);
  },
});

/**
 * Variable Values Update
 */
type VariableValuesUpdateState = Record<string, StatusT<number>>;

const initialVariableValuesUpdateState: VariableValuesUpdateState = {};

const variableValuesUpdateSlice = createSlice({
  name: 'variableValuesUpdateSlice',
  initialState: initialVariableValuesUpdateState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableValuesUpdateState>) => {
    buildReducers(requestUpdateVariableValues)(builder);
  },
});

/**
 * Upload Variable Value Image
 */
type VariableValuesImageUploadState = Record<string, StatusT<number>>;

const initialVariableValuesImageUploadState: VariableValuesImageUploadState = {};

const variableValuesImageUploadSlice = createSlice({
  name: 'variableValuesImageUploadSlice',
  initialState: initialVariableValuesImageUploadState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableValuesImageUploadState>) => {
    buildReducers(requestUploadImageValue)(builder);
  },
});

export const documentProducerVariableValuesReducers = {
  documentProducerVariableValuesImageUpload: variableValuesImageUploadSlice.reducer,
  documentProducerVariableValuesList: variableValuesListSlice.reducer,
  documentProducerVariableValuesUpdate: variableValuesUpdateSlice.reducer,
};
