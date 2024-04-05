import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import { requestListVariablesValues, requestUpdateVariableValues, requestUploadImageValue } from './valuesThunks';

/**
 * Variable Values List
 */
type VariableValuesListState = Record<string, StatusT<VariableValue[]>>;

const initialVariableValuesListState: VariableValuesListState = {};

export const variableValuesListSlice = createSlice({
  name: 'variableValuesListSlice',
  initialState: initialVariableValuesListState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableValuesListState>) => {
    buildReducers(requestListVariablesValues, true)(builder);
  },
});

export const variableValuesListReducer = variableValuesListSlice.reducer;

/**
 * Variable Values Update
 */
type VariableValuesUpdateState = Record<string, StatusT<number>>;

const initialVariableValuesUpdateState: VariableValuesUpdateState = {};

export const variableValuesUpdateSlice = createSlice({
  name: 'variableValuesUpdateSlice',
  initialState: initialVariableValuesUpdateState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableValuesUpdateState>) => {
    buildReducers(requestUpdateVariableValues)(builder);
  },
});

export const variableValuesUpdateReducer = variableValuesUpdateSlice.reducer;

/**
 * Upload Variable Value Image
 */
type VariableValuesImageUploadState = Record<string, StatusT<number>>;

const initialVariableValuesImageUploadState: VariableValuesImageUploadState = {};

export const variableValuesImageUploadSlice = createSlice({
  name: 'variableValuesImageUploadSlice',
  initialState: initialVariableValuesImageUploadState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<VariableValuesImageUploadState>) => {
    buildReducers(requestUploadImageValue)(builder);
  },
});

export const variableValuesImageUploadReducer = variableValuesImageUploadSlice.reducer;
