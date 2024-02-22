import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchResponseDeliverableAdmin, SearchResponseDeliverableBase } from 'src/services/DeliverablesService';

export type DeliverablesResponseData = {
  error?: string | true;
  deliverables?: (SearchResponseDeliverableAdmin | SearchResponseDeliverableBase)[];
};

const initialState: Record<number, DeliverablesResponseData> = {};

// `orgId` will be -1 for the admin records
type SetDeliverableListPayload = { organizationId: number; data: DeliverablesResponseData };

export const deliverableListSlice = createSlice({
  name: 'deliverableListSlice',
  initialState,
  reducers: {
    setDeliverableListAction: (state, action: PayloadAction<SetDeliverableListPayload>) => {
      const payload: SetDeliverableListPayload = action.payload;
      state[payload.organizationId] = payload.data;
    },
  },
});

export const { setDeliverableListAction } = deliverableListSlice.actions;

export const deliverableListReducer = deliverableListSlice.reducer;
