import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestCreateDocument,
  requestMarkSubmitted,
  requestSaveVersion,
  requestUpdateDocument,
} from 'src/redux/features/documentProducer/documents/documentsThunks';

/**
 * Document operations
 */
type DocumentRequestsState = Record<string, StatusT<number>>;
const initialDocumentRequestsState: DocumentRequestsState = {};

const documentRequestsSlice = createSlice({
  name: 'documentRequestsSlice',
  initialState: initialDocumentRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentRequestsState>) => {
    buildReducers(requestCreateDocument)(builder);
    buildReducers(requestUpdateDocument)(builder);
    buildReducers(requestSaveVersion)(builder);
    buildReducers(requestMarkSubmitted)(builder);
  },
});

export const documentProducerDocumentsReducers = {
  documentProducerDocumentRequests: documentRequestsSlice.reducer,
};
