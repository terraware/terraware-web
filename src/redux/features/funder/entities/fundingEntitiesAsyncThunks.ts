import { createAsyncThunk } from '@reduxjs/toolkit';

import FundingEntityService from 'src/services/funder/FundingEntityService';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

export const requestFundingEntityForUser = createAsyncThunk(
  'funding-entities/get-for-user',
  async (userId: number, { rejectWithValue }) => {
    const response = await FundingEntityService.getUserFundingEntity(userId);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestFundingEntity = createAsyncThunk(
  'funding-entities/get',
  async (fundingEntityId: number, { rejectWithValue }) => {
    const response = await FundingEntityService.get(fundingEntityId);

    if (response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestFundingEntities = createAsyncThunk('funding-entities/list', async (_, { rejectWithValue }) => {
  const response = await FundingEntityService.listFundingEntities();

  if (response && response.requestSucceeded) {
    return response;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestUpdateFundingEntity = createAsyncThunk(
  'funding-entities/update',
  async (request: { fundingEntity: FundingEntity }, { rejectWithValue }) => {
    const { fundingEntity } = request;

    const response = await FundingEntityService.update(fundingEntity);
    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateFundingEntity = createAsyncThunk(
  'funding-entities/create',
  async (request: { fundingEntity: FundingEntity }, { rejectWithValue }) => {
    const { fundingEntity } = request;

    const response = await FundingEntityService.create(fundingEntity);
    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestFundingEntityInviteFunder = createAsyncThunk(
  'funding-entities/invite',
  async (request: { fundingEntityId: number; email: string }, { rejectWithValue }) => {
    const { fundingEntityId, email } = request;
    const response = await FundingEntityService.inviteFunder(fundingEntityId, email);

    if (response) {
      if (response.requestSucceeded) {
        return response.data;
      } else if (response.errorDetails === 'PRE_EXISTING_USER') {
        return rejectWithValue(strings.EMAIL_ALREADY_EXISTS);
      } else if (response.errorDetails === 'INVALID_EMAIL') {
        return rejectWithValue(strings.INCORRECT_EMAIL_FORMAT);
      }
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListFunders = createAsyncThunk(
  'funding-entities/list',
  async (fundingEntityId: number, { rejectWithValue }) => {
    const response = await FundingEntityService.listFunders(fundingEntityId);
    if (response && response.requestSucceeded) {
      return response.data?.funders ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteFunders = createAsyncThunk(
  'funder/delete',
  async (request: { fundingEntityId: number; userIds: number[] }, { rejectWithValue }) => {
    const { fundingEntityId, userIds } = request;
    const response = await FundingEntityService.deleteFunders(fundingEntityId, userIds);
    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectFundingEntities = createAsyncThunk(
  'funding-entities/list-for-project',
  async ({ projectId }: { projectId: number }, { rejectWithValue }) => {
    const response = await FundingEntityService.listForProject(projectId);

    if (response.requestSucceeded) {
      return response.fundingEntities || [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
