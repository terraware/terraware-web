import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Deliverable,
  SearchResponseDeliverableAdmin,
  SearchResponseDeliverableBase,
} from 'src/services/DeliverablesService';

/**
 * Deliverable list
 */
export type DeliverablesResponseData = {
  error?: string | true;
  deliverables?: (SearchResponseDeliverableAdmin | SearchResponseDeliverableBase)[];
};

const initialStateDeliverableList: Record<number, DeliverablesResponseData> = {};

// `orgId` will be -1 for the admin records
type SetDeliverableListPayload = { organizationId: number; data: DeliverablesResponseData };

export const deliverableListSlice = createSlice({
  name: 'deliverableListSlice',
  initialState: initialStateDeliverableList,
  reducers: {
    setDeliverableListAction: (state, action: PayloadAction<SetDeliverableListPayload>) => {
      const payload: SetDeliverableListPayload = action.payload;
      state[payload.organizationId] = payload.data;
    },
  },
});

export const { setDeliverableListAction } = deliverableListSlice.actions;

export const deliverableListReducer = deliverableListSlice.reducer;

/**
 * Individual Deliverable
 */
export type DeliverableResponseData = {
  error?: string | true;
  deliverable?: Deliverable;
};

const initialStateDeliverable: Record<number, DeliverableResponseData> = {};

type SetDeliverablePayload = { deliverableId: number; data: DeliverableResponseData };

export const deliverablesSlice = createSlice({
  name: 'deliverableListSlice',
  initialState: initialStateDeliverable,
  reducers: {
    setDeliverableAction: (state, action: PayloadAction<SetDeliverablePayload>) => {
      const payload: SetDeliverablePayload = action.payload;
      state[payload.deliverableId] = payload.data;
    },
  },
});

export const { setDeliverableAction } = deliverablesSlice.actions;

export const deliverablesReducer = deliverablesSlice.reducer;
