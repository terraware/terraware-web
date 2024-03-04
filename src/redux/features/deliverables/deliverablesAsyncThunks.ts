import { createAsyncThunk } from '@reduxjs/toolkit';

import DeliverablesService, { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import { Deliverable, DeliverableData } from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

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
