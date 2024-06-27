import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { UserDeliverableCategoriesData } from 'src/types/UserDeliverableCategories';

import {
  requestGetUserDeliverableCategories,
  requestUpdateUserDeliverableCategories,
} from './userDeliverableCategoriesAsyncThunks';

/**
 * Deliverable categories for user.
 */
const initialStateUserDeliverableCategoriesGet: { [requestId: string]: StatusT<UserDeliverableCategoriesData> } = {};

export const userDeliverableCategoriesGetSlice = createSlice({
  name: 'userDeliverableCategoriesGetSlice',
  initialState: initialStateUserDeliverableCategoriesGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetUserDeliverableCategories)(builder);
  },
});

/**
 * Simple OK/response for requests updating a user's deliverable categories, keeps
 * state of user id that was edited.
 */
const initialStateUserDeliverableCategoriesUpdate: { [requestId: string]: StatusT<number> } = {};

export const userDeliverableCategoriesUpdateSlice = createSlice({
  name: 'userDeliverableCategoriesUpdateSlice',
  initialState: initialStateUserDeliverableCategoriesUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateUserDeliverableCategories)(builder);
  },
});

const userDeliverableCategoriesReducers = {
  userDeliverableCategoriesGet: userDeliverableCategoriesGetSlice.reducer,
  userDeliverableCategoriesUpdate: userDeliverableCategoriesUpdateSlice.reducer,
};

export default userDeliverableCategoriesReducers;
