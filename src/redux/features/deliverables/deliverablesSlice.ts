import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestCompleteDeliverable,
  requestGetDeliverable,
  requestIncompleteDeliverable,
  requestListDeliverables,
  requestSubmitDeliverable,
  requestUpdateDeliverable,
  requestUploadDeliverableDocument,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { DeliverableWithOverdue, ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';

/**
 * Deliverable list
 */
const initialStateDeliverablesList: { [key: string]: StatusT<ListDeliverablesElementWithOverdue[]> } = {};

export const deliverablesListSlice = createSlice({
  name: 'deliverablesListSlice',
  initialState: initialStateDeliverablesList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListDeliverables)(builder);
  },
});

/**
 * Individual Deliverable
 * Can be accessed by a request ID or by a deliverable/project ID string
 */
const initialStateDeliverable: { [key: number | string]: StatusT<DeliverableWithOverdue> } = {};

type DeliverableProjectIdArg = { deliverableId: number; projectId: number };
export const deliverableCompositeKeyFn = (arg: unknown): string => {
  const castArg = arg as DeliverableProjectIdArg;
  if (!(castArg.deliverableId && castArg.projectId)) {
    return '';
  }

  return `d${castArg.deliverableId}-p${castArg.projectId}`;
};

export const deliverablesSlice = createSlice({
  name: 'deliverablesSlice',
  initialState: initialStateDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetDeliverable, true, deliverableCompositeKeyFn)(builder);
  },
});

/**
 * Simple OK/response for requests such as updating deliverable status, keeps
 * state of deliverable id that was edited.
 */
const initialStateEditDeliverable: { [key: number | string]: StatusT<number | string> } = {};

export const deliverablesEditSlice = createSlice({
  name: 'deliverablesEditSlice',
  initialState: initialStateEditDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateDeliverable)(builder);
    buildReducers(requestUploadDeliverableDocument)(builder);
    buildReducers(requestSubmitDeliverable)(builder);
    buildReducers(requestCompleteDeliverable)(builder);
    buildReducers(requestIncompleteDeliverable)(builder);
  },
});

const deliverablesReducers = {
  deliverablesSearch: deliverablesListSlice.reducer,
  deliverables: deliverablesSlice.reducer,
  deliverablesEdit: deliverablesEditSlice.reducer,
};

export default deliverablesReducers;
