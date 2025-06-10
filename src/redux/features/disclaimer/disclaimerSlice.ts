import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Disclaimer } from 'src/types/Disclaimer';

import { requestAcceptDisclaimer, requestDisclaimer } from './disclaimerAsyncThunks';

const initialStateDisclaimer: { [key: string]: StatusT<Disclaimer> } = {};

export const disclaimerSlice = createSlice({
  name: 'disclaimerSlice',
  initialState: initialStateDisclaimer,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDisclaimer)(builder);
  },
});

const initialStateAcceptDisclaimer: { [key: string]: StatusT<void> } = {};

export const acceptDisclaimerSlice = createSlice({
  name: 'acceptDisclaimerSlice',
  initialState: initialStateAcceptDisclaimer,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAcceptDisclaimer)(builder);
  },
});

const disclaimersReducers = {
  disclaimer: disclaimerSlice.reducer,
  disclaimerAccept: acceptDisclaimerSlice.reducer,
};

export default disclaimersReducers;
