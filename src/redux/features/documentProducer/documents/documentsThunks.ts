import { createAsyncThunk } from '@reduxjs/toolkit';

import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
import DocumentService from 'src/services/documentProducer/DocumentService';
import strings from 'src/strings';
import {
  CreateDocumentPayload,
  CreateSavedDocVersionPayload,
  UpdateDocumentPayload,
  UpdateSavedDocVersionPayload,
  UpgradeManifestPayload,
} from 'src/types/documentProducer/Document';

export const requestCreateDocument = createAsyncThunk(
  'createDocument',
  async (document: CreateDocumentPayload, { dispatch, rejectWithValue }) => {
    const response = await DocumentService.createDocument(document);
    if (response.requestSucceeded && response.data?.document) {
      dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.Documents, id: 'LIST' }]));
      return response.data.document;
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
  async ({ id, payload }: UpdateDocumentRequest, { dispatch, rejectWithValue }) => {
    const response = await DocumentService.updateDocument(id, payload);
    if (response.requestSucceeded) {
      dispatch(
        baseApi.util.invalidateTags([
          { type: QueryTagTypes.Documents, id },
          { type: QueryTagTypes.Documents, id: 'LIST' },
          { type: QueryTagTypes.DocumentHistory, id },
        ])
      );
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
  async ({ id, payload }: UpgradeManifestRequest, { dispatch, rejectWithValue }) => {
    const response = await DocumentService.upgradeManifest(id, payload);
    if (response.requestSucceeded) {
      dispatch(
        baseApi.util.invalidateTags([
          QueryTagTypes.Variables,
          QueryTagTypes.VariableValues,
          { type: QueryTagTypes.Documents, id: Number(id) },
          { type: QueryTagTypes.Documents, id: 'LIST' },
          { type: QueryTagTypes.DocumentHistory, id: Number(id) },
        ])
      );
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);

export type SaveVersionRequest = {
  docId: number;
  payload: CreateSavedDocVersionPayload;
};

export const requestSaveVersion = createAsyncThunk(
  'saveVersion',
  async ({ docId, payload }: SaveVersionRequest, { dispatch, rejectWithValue }) => {
    const response = await DocumentService.saveVersion(docId, payload);

    if (response.requestSucceeded) {
      dispatch(
        baseApi.util.invalidateTags([
          { type: QueryTagTypes.Documents, id: docId },
          { type: QueryTagTypes.Documents, id: 'LIST' },
          { type: QueryTagTypes.DocumentHistory, id: docId },
        ])
      );
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
  async ({ docId, versionId, payload }: MarkSubmittedRequest, { dispatch, rejectWithValue }) => {
    const response = await DocumentService.markSubmitted(docId, versionId, payload);

    if (response.requestSucceeded) {
      dispatch(
        baseApi.util.invalidateTags([
          { type: QueryTagTypes.Documents, id: docId },
          { type: QueryTagTypes.Documents, id: 'LIST' },
          { type: QueryTagTypes.DocumentHistory, id: docId },
        ])
      );
      return true;
    }

    return rejectWithValue(response.error || strings.GENERIC_ERROR);
  }
);
