import { createAsyncThunk } from '@reduxjs/toolkit';

import UserDeliverableCategoriesService from 'src/services/UserDeliverableCategoriesService';
import strings from 'src/strings';
import { DeliverableCategoryType } from 'src/types/Deliverables';
import { User } from 'src/types/User';

export const requestGetUserDeliverableCategories = createAsyncThunk(
  'userDeliverableCategories/get-for-user',
  async (userId: number, { rejectWithValue }) => {
    const response = await UserDeliverableCategoriesService.get(userId);
    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateUserDeliverableCategories = createAsyncThunk(
  'userDeliverableCategories/update-for-user',
  async (request: { user: User; deliverableCategories: DeliverableCategoryType[] }, { rejectWithValue }) => {
    const { user, deliverableCategories } = request;

    const response = await UserDeliverableCategoriesService.update(user, deliverableCategories);
    if (response && response.requestSucceeded) {
      return user.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
