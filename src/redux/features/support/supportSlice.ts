import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ServiceRequestType } from 'src/types/Support';

import { requestListSupportRequestTypes, requestSubmitSupportRequest } from './supportAsyncThunks';

/**
 * Simple response to know if the list support request types were successful
 */
const initialSupportRequestTypes: { [key: string]: StatusT<ServiceRequestType[]> } = {};

export const supportRequestTypesListSlice = createSlice({
  name: 'supportRequestTypesListSlice',
  initialState: initialSupportRequestTypes,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListSupportRequestTypes)(builder);
  },
});

/**
 * Simple response to know if the support request was submitted
 */
const initialStateSupportRequestSubmit: { [key: string]: StatusT<string> } = {};

export const supportRequestSubmitSlice = createSlice({
  name: 'supportRequestSubmitSlice',
  initialState: initialStateSupportRequestSubmit,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSubmitSupportRequest)(builder);
  },
});

const supportReducers = {
  supportRequestTypes: supportRequestTypesListSlice.reducer,
  supportRequestSubmit: supportRequestSubmitSlice.reducer,
};

export default supportReducers;
