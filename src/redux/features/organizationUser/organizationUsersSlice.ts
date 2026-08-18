import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { OrganizationUser } from 'src/types/User';

import { requestListOrganizationUsers } from './organizationUsersAsyncThunks';

type OrganizationUsersData = {
  users: OrganizationUser[];
};

const initialStateOrganizationUsers: { [key: string]: StatusT<OrganizationUsersData> } = {};

const organizationUsersListSlice = createSlice({
  name: 'organizationUsersListSlice',
  initialState: initialStateOrganizationUsers,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListOrganizationUsers)(builder);
  },
});

const organizationUsersReducers = {
  organizationUsersList: organizationUsersListSlice.reducer,
};

export default organizationUsersReducers;
