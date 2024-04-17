import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestGetDeliverable,
  requestListDeliverables,
  requestUpdateDeliverable,
  requestUploadDeliverableDocument,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { Deliverable, DeliverablesData } from 'src/types/Deliverables';

/**
 * Deliverable list
 */
const initialStateDeliverablesList: { [key: string]: StatusT<DeliverablesData> } = {};

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
const initialStateDeliverables: { [key: number | string]: StatusT<Deliverable> } = {};

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
  initialState: initialStateDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetDeliverable, true, deliverableCompositeKeyFn)(builder);
  },
});

/**
 * Simple OK/response for requests such as updating deliverable status, keeps
 * state of deliverable id that was edited.
 */
const initialStateEditDeliverable: { [key: number | string]: StatusT<number> } = {};

export const deliverablesEditSlice = createSlice({
  name: 'deliverablesEditSlice',
  initialState: initialStateEditDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateDeliverable)(builder);
    buildReducers(requestUploadDeliverableDocument)(builder);
  },
});

const deliverablesReducers = {
  deliverablesSearch: deliverablesListSlice.reducer,
  deliverables: deliverablesSlice.reducer,
  deliverablesEdit: deliverablesEditSlice.reducer,
};

export default deliverablesReducers;
