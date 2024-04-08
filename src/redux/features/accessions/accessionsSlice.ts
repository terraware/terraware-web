import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SearchResponseAccession } from 'src/services/SeedBankService';

type OrgIdSpeciesId = string;

export type AccessionsResponseData = {
  error?: string | true;
  accessions?: SearchResponseAccession[];
};

const initialState: Record<OrgIdSpeciesId, AccessionsResponseData> = {};

type SetAccessionsPayload = { orgIdSpeciesId: OrgIdSpeciesId; data: AccessionsResponseData };

export const accessionsSlice = createSlice({
  name: 'accessionsSlice',
  initialState,
  reducers: {
    setAccessionsAction: (state, action: PayloadAction<SetAccessionsPayload>) => {
      const payload: SetAccessionsPayload = action.payload;
      state[payload.orgIdSpeciesId] = payload.data;
    },
  },
});

export const { setAccessionsAction } = accessionsSlice.actions;

export const accessionsReducer = accessionsSlice.reducer;
