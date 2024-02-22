import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchResponseDeliverableAdmin, SearchResponseDeliverableBase } from 'src/services/DeliverablesService';

export type DeliverablesResponseData = {
  error?: string | true;
  deliverables?: (SearchResponseDeliverableAdmin | SearchResponseDeliverableBase)[];
};

const initialState: Record<number, DeliverablesResponseData> = {};

// `orgId` will be -1 for the admin records
type SetDeliverablesPayload = { organizationId: number; data: DeliverablesResponseData };

export const deliverablesSlice = createSlice({
  name: 'deliverablesSlice',
  initialState,
  reducers: {
    setDeliverablesAction: (state, action: PayloadAction<SetDeliverablesPayload>) => {
      const payload: SetDeliverablesPayload = action.payload;
      state[payload.organizationId] = payload.data;
    },
  },
});

export const { setDeliverablesAction } = deliverablesSlice.actions;

export const deliverablesReducer = deliverablesSlice.reducer;
