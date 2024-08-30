import { createAsyncThunk } from '@reduxjs/toolkit';

import DeliverablesService, { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import {
  Deliverable,
  ListDeliverablesElementWithOverdue,
  UploadDeliverableDocumentRequest,
} from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn } from 'src/utils/searchAndSort';

export const requestListDeliverables = createAsyncThunk(
  'deliverables/list',
  async (
    request: {
      locale: string | null;
      listRequest?: ListDeliverablesRequestParams;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
      searchAndSort?: SearchAndSortFn<ListDeliverablesElementWithOverdue>;
    },
    { rejectWithValue }
  ) => {
    const { listRequest, locale, search, searchSortOrder, searchAndSort } = request;

    const response = await DeliverablesService.list(locale, listRequest, search, searchSortOrder, searchAndSort);
    if (response && response.requestSucceeded) {
      return response.data ?? [];
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetDeliverable = createAsyncThunk(
  'deliverables/get-one',
  async (request: { deliverableId: number; projectId: number }, { rejectWithValue }) => {
    const { projectId, deliverableId } = request;
    const response = await DeliverablesService.get(deliverableId, projectId);
    if (response && response.requestSucceeded) {
      return response.data;
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

export const requestUploadDeliverableDocument = createAsyncThunk(
  'deliverables/upload',
  async (request: { deliverableId: number; documents: UploadDeliverableDocumentRequest[] }, { rejectWithValue }) => {
    const { deliverableId, documents } = request;

    const responses = await DeliverablesService.upload(deliverableId, documents);
    if (responses.every((response) => response?.requestSucceeded === true)) {
      return deliverableId;
    }

    if (responses.find((response) => response?.statusCode === 507)) {
      return rejectWithValue(strings.ERROR_SUPPORT_NOTIFIED);
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestSubmitDeliverable = createAsyncThunk(
  'deliverables/submit',
  async (request: { deliverableId: number; projectId: number }, { rejectWithValue }) => {
    const { deliverableId, projectId } = request;

    const response = await DeliverablesService.submit(deliverableId, projectId);
    if (response && response.requestSucceeded) {
      return deliverableId;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
