import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { UserWithGlobalRolesData } from 'src/services/GlobalRolesService';
import { GlobalRolesUsersData } from 'src/types/GlobalRoles';

import {
  requestGetGlobalRolesUser,
  requestListGlobalRolesUsers,
  requestUpdateGlobalRolesUser,
} from './globalRolesAsyncThunks';

/**
 * Single User with global roles
 */
const initialStateGlobalRolesUser: { [key: string]: StatusT<UserWithGlobalRolesData> } = {};

export const globalRolesUserSlice = createSlice({
  name: 'globalRolesUserSlice',
  initialState: initialStateGlobalRolesUser,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetGlobalRolesUser, true)(builder);
  },
});

export const globalRolesUserReducer = globalRolesUserSlice.reducer;

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
