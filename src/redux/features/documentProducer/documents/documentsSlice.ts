import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestCreateDocument,
  requestGetDocument,
  requestListDocuments,
  requestListHistory,
  requestMarkSubmitted,
  requestSaveVersion,
  requestSearchDocuments,
  requestUpdateDocument,
} from 'src/redux/features/documentProducer/documents/documentsThunks';
import {
  DocumentHistoryCreatedPayload,
  DocumentHistoryEditedPayload,
  DocumentHistorySavedPayload,
} from 'src/types/documentProducer/Document';
import { Document } from 'src/types/documentProducer/Document';

/**
 * Get Document List
 */
type DocumentListState = Record<string, StatusT<Document[]>>;
const initialDocumentListState: DocumentListState = {};

const documentListSlice = createSlice({
  name: 'documentListSlice',
  initialState: initialDocumentListState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentListState>) => {
    buildReducers(requestListDocuments)(builder);
  },
});

/**
 * Get Document
 */
type DocumentState = Record<string, StatusT<Document>>;
const initialDocumentState: DocumentState = {};

const documentSlice = createSlice({
  name: 'documentSlice',
  initialState: initialDocumentState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentState>) => {
    buildReducers(requestGetDocument, true)(builder);
  },
});

/**
 * Get Document History
 */
type DocumentListHistoryState = Record<
  string,
  StatusT<(DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload | DocumentHistorySavedPayload)[]>
>;
const initialDocumentListHistoryState: DocumentListHistoryState = {};

const documentListHistorySlice = createSlice({
  name: 'documentListHistorySlice',
  initialState: initialDocumentListHistoryState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentListHistoryState>) => {
    buildReducers(requestListHistory, true)(builder);
  },
});

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

/**
 * Search Documents
 */
type DocumentSearchState = Record<string, StatusT<Document[]>>;
const initialDocumentSearchState: DocumentSearchState = {};

const documentSearchSlice = createSlice({
  name: 'documentSearchSlice',
  initialState: initialDocumentSearchState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentSearchState>) => {
    buildReducers(requestSearchDocuments)(builder);
  },
});

export const documentProducerDocumentsReducers = {
  documentProducerDocumentList: documentListSlice.reducer,
  documentProducerDocumentListHistory: documentListHistorySlice.reducer,
  documentProducerDocument: documentSlice.reducer,
  documentProducerDocumentRequests: documentRequestsSlice.reducer,
  documentProducerDocumentSearch: documentSearchSlice.reducer,
};
