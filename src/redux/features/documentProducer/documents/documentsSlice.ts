import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestCreateDocument,
  requestGetDocument,
  requestListDocuments,
  requestListHistory,
  requestMarkSubmitted,
  requestSaveVersion,
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

export const documentListSlice = createSlice({
  name: 'documentListSlice',
  initialState: initialDocumentListState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentListState>) => {
    buildReducers(requestListDocuments)(builder);
  },
});

export const documentListReducer = documentListSlice.reducer;

/**
 * Get Document
 */
type DocumentState = Record<string, StatusT<Document>>;
const initialDocumentState: DocumentState = {};

export const documentSlice = createSlice({
  name: 'documentSlice',
  initialState: initialDocumentState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentState>) => {
    buildReducers(requestGetDocument, true)(builder);
  },
});

export const documentReducer = documentSlice.reducer;

/**
 * Get Document History
 */
type DocumentListHistoryState = Record<
  string,
  StatusT<(DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload | DocumentHistorySavedPayload)[]>
>;
const initialDocumentListHistoryState: DocumentListHistoryState = {};

export const documentListHistorySlice = createSlice({
  name: 'documentListHistorySlice',
  initialState: initialDocumentListHistoryState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DocumentListHistoryState>) => {
    buildReducers(requestListHistory, true)(builder);
  },
});

export const documentListHistoryReducer = documentListHistorySlice.reducer;

/**
 * Document operations
 */
type DocumentRequestsState = Record<string, StatusT<number>>;
const initialDocumentRequestsState: DocumentRequestsState = {};

export const documentRequestsSlice = createSlice({
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

export const documentRequestsReducer = documentRequestsSlice.reducer;
