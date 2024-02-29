import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { Response } from 'src/services/HttpService';
import DeliverablesService, { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
<<<<<<< HEAD
<<<<<<< HEAD
import { Deliverable, DeliverableData } from 'src/types/Deliverables';
=======
import { DeliverableData, UpdateRequest } from 'src/types/Deliverables';
>>>>>>> 1e4ce5e0d6 (Rewire 'list deliverables' and 'get deliverable' mocked redux to use the API from the backend)
=======
import { Deliverable, DeliverableData } from 'src/types/Deliverables';
>>>>>>> 3c3fc3103f (Implement the update API from the backend)

export const requestListDeliverables = createAsyncThunk(
  'deliverables/list',
  async (
    request: {
      locale: string | null;
      listRequest?: ListDeliverablesRequestParams;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { listRequest, locale, search, searchSortOrder } = request;
<<<<<<< HEAD
=======

<<<<<<< HEAD
    const response = await DeliverablesService.listDeliverables(locale, listRequest, search, searchSortOrder);
>>>>>>> 1e4ce5e0d6 (Rewire 'list deliverables' and 'get deliverable' mocked redux to use the API from the backend)

=======
>>>>>>> 3c3fc3103f (Implement the update API from the backend)
    const response = await DeliverablesService.list(locale, listRequest, search, searchSortOrder);
    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetDeliverable = createAsyncThunk(
  'deliverables/get-one',
  async (deliverableId: number, { rejectWithValue }) => {
    const response: Response & DeliverableData = await DeliverablesService.get(deliverableId);
    if (response && response.requestSucceeded) {
      return response.deliverable;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateDeliverable = createAsyncThunk(
  'deliverables/update',
  async (request: { deliverable: Deliverable }, { rejectWithValue }) => {
    const { deliverable } = request;

    const response: Response = await DeliverablesService.update(deliverable);
    if (response && response.requestSucceeded) {
      return deliverable.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
