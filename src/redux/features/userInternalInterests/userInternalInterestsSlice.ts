import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { UserInternalInterestsData } from 'src/types/UserInternalInterests';

import {
  requestGetUserInternalInterests,
  requestUpdateUserInternalInterests,
} from './userInternalInterestsAsyncThunks';

/**
 * Internal interests for user.
 */
const initialStateUserInternalInterestsGet: { [userId: number]: StatusT<UserInternalInterestsData> } = {};

export const userInternalInterestsGetSlice = createSlice({
  name: 'userInternalInterestsGetSlice',
  initialState: initialStateUserInternalInterestsGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetUserInternalInterests, true)(builder);
  },
});

/**
 * Simple OK/response for requests updating a user's internal interests, keeps
 * state of user id that was edited.
 */
const initialStateUserInternalInterestsUpdate: { [requestId: string]: StatusT<number> } = {};

export const userInternalInterestsUpdateSlice = createSlice({
  name: 'userInternalInterestsUpdateSlice',
  initialState: initialStateUserInternalInterestsUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateUserInternalInterests)(builder);
  },
});

const userInternalInterestsReducers = {
  userInternalInterestsGet: userInternalInterestsGetSlice.reducer,
  userInternalInterestsUpdate: userInternalInterestsUpdateSlice.reducer,
};

export default userInternalInterestsReducers;
