import { createAsyncThunk } from '@reduxjs/toolkit';

import DocumentService from 'src/services/documentProducer/DocumentService';
import strings from 'src/strings';
import {
  CreateDocumentPayload,
  CreateSavedDocVersionPayload,
  UpdateDocumentPayload,
  UpdateSavedDocVersionPayload,
  UpgradeManifestPayload,
} from 'src/types/documentProducer/Document';

export const requestGetDocument = createAsyncThunk('getDocument', async (id: number, { rejectWithValue }) => {
  const response = await DocumentService.getDocument(id);
  if (response.requestSucceeded && response.data?.pdd) {
    return response.data.pdd;
  }

  return rejectWithValue(response.error || strings.GENERIC_ERROR);
});

export const requestListDocuments = createAsyncThunk('listDocuments', async (_, { rejectWithValue }) => {
  const response = await DocumentService.getDocuments();
  if (response.requestSucceeded && response.data?.pdds) {
    return response.data.pdds;
  }

  return rejectWithValue(response.error || strings.GENERIC_ERROR);
});

export const requestCreateDocument = createAsyncThunk(
  'createDocument',
  async (pdd: CreateDocumentPayload, { rejectWithValue }) => {
    const response = await DocumentService.createDocument(pdd);
    if (response.requestSucceeded && response.data?.pdd) {
      return response.data.pdd;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export type UpdateDocumentRequest = {
  id: number;
  payload: UpdateDocumentPayload;
};

export const requestUpdateDocument = createAsyncThunk(
  'updateDocument',
  async ({ id, payload }: UpdateDocumentRequest, { rejectWithValue }) => {
    const response = await DocumentService.updateDocument(id, payload);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export type UpgradeManifestRequest = {
  id: string;
  payload: UpgradeManifestPayload;
};

export const requestUpgradeManifest = createAsyncThunk(
  'updateDocument',
  async ({ id, payload }: UpgradeManifestRequest, { rejectWithValue }) => {
    const response = await DocumentService.upgradeManifest(id, payload);
    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export const requestListHistory = createAsyncThunk('listHistory', async (documentId: number, { rejectWithValue }) => {
  const response = await DocumentService.listHistory(documentId);
  if (response.requestSucceeded && response.data?.history) {
    return response.data.history;
  }

  return rejectWithValue(response.error || strings.GENERIC_ERROR);
});

export type SaveVersionRequest = {
  docId: number;
  payload: CreateSavedDocVersionPayload;
};

export const requestSaveVersion = createAsyncThunk(
  'saveVersion',
  async ({ docId, payload }: SaveVersionRequest, { rejectWithValue }) => {
    const response = await DocumentService.saveVersion(docId, payload);

    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export type MarkSubmittedRequest = {
  docId: number;
  versionId: number;
  payload: UpdateSavedDocVersionPayload;
};

export const requestMarkSubmitted = createAsyncThunk(
  'markSubmitted',
  async ({ docId, versionId, payload }: MarkSubmittedRequest, { rejectWithValue }) => {
    const response = await DocumentService.markSubmitted(docId, versionId, payload);

    if (response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
