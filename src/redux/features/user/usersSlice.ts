import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { User } from 'src/types/User';

import { requestGetUser, requestSearchUserByEmail } from './usersAsyncThunks';

/**
 * Get single user by ID
 */
const initialStateUsers: { [key: string]: StatusT<{ user: User }> } = {};

export const usersSlice = createSlice({
  name: 'usersSlice',
  initialState: initialStateUsers,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetUser, true)(builder);
  },
});

export const usersReducer = usersSlice.reducer;

/**
 * Get single user by email
 */
const initialStateUsersByEmail: { [key: string]: StatusT<{ user: User }> } = {};

export const usersByEmailSlice = createSlice({
  name: 'usersByEmailSlice',
  initialState: initialStateUsersByEmail,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSearchUserByEmail, true)(builder);
  },
});

export const usersByEmailReducer = usersByEmailSlice.reducer;
