import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { GlobalRolesUsersData } from 'src/types/GlobalRoles';

import {
  requestListGlobalRolesUsers,
  requestRemoveGlobalRolesForUsers,
  requestUpdateGlobalRolesUser,
} from './globalRolesAsyncThunks';

/**
 * Users with global roles list
 */
const initialStateGlobalRolesUsersList: { [key: string]: StatusT<GlobalRolesUsersData> } = {};

export const globalRolesUsersListSlice = createSlice({
  name: 'globalRolesUsersListSlice',
  initialState: initialStateGlobalRolesUsersList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListGlobalRolesUsers)(builder);
  },
});

export const globalRolesUsersListReducer = globalRolesUsersListSlice.reducer;

/**
 * Simple OK/response for requests removing all global roles for a list of users, keeps
 * state of user ids that was were modified.
 */
const initialStateGlobalRolesUsersRemove: { [key: number | string]: StatusT<number[]> } = {};

export const globalRolesUsersRemoveSlice = createSlice({
  name: 'globalRolesUsersRemoveSlice',
  initialState: initialStateGlobalRolesUsersRemove,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestRemoveGlobalRolesForUsers)(builder);
  },
});

export const globalRolesUsersRemoveReducer = globalRolesUsersRemoveSlice.reducer;

/**
 * Simple OK/response for requests updating a user's global roles, keeps
 * state of user id that was edited.
 */
const initialStateGlobalRolesUserUpdate: { [key: number | string]: StatusT<number> } = {};

export const globalRolesUserUpdateSlice = createSlice({
  name: 'globalRolesUserUpdateSlice',
  initialState: initialStateGlobalRolesUserUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateGlobalRolesUser)(builder);
  },
});

export const globalRolesUserUpdateReducer = globalRolesUserUpdateSlice.reducer;
