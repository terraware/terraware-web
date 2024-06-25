import HttpService, { Response2 } from 'src/services/HttpService';
import {
  CreateDocumentPayload,
  CreateDocumentResponse,
  CreateSavedDocVersionPayload,
  CreateSavedDocVersionResponsePayload,
  DocumentGetResponse,
  DocumentHistoryGetResponse,
  DocumentListResponse,
  UpdateDocumentPayload,
  UpdateDocumentResponse,
  UpdateSavedDocVersionPayload,
  UpgradeManifestPayload,
  UpgradeManifestResponse,
} from 'src/types/documentProducer/Document';

const DOCUMENTS_ENDPOINT = '/api/v1/documents';
const DOCUMENT_ENDPOINT = '/api/v1/documents/{id}';
const DOCUMENT_HISTORY_ENDPOINT = '/api/v1/documents/{id}/history';
const DOCUMENT_VERSIONS_ENDPOINT = '/api/v1/documents/{docId}/versions';
const DOCUMENT_VERSION_ENDPOINT = '/api/v1/documents/{docId}/versions/{versionId}';
const DOCUMENT_UPGRADE_ENDPOINT = '/api/v1/documents/{id}/upgrade';

const getDocument = async (id: number): Promise<Response2<DocumentGetResponse>> =>
  await HttpService.root(DOCUMENT_ENDPOINT).get2({
    urlReplacements: { '{id}': id.toString() },
  });

const getDocuments = async (): Promise<Response2<DocumentListResponse>> =>
  await HttpService.root(DOCUMENTS_ENDPOINT).get2({});

const createDocument = async (payload: CreateDocumentPayload): Promise<Response2<CreateDocumentResponse>> =>
  await HttpService.root(DOCUMENTS_ENDPOINT).post({ entity: payload });

const updateDocument = async (id: number, payload: UpdateDocumentPayload): Promise<Response2<UpdateDocumentResponse>> =>
  await HttpService.root(DOCUMENT_ENDPOINT).put({
    entity: payload,
    urlReplacements: { '{id}': id.toString() },
  });

const upgradeManifest = async (
  id: string,
  payload: UpgradeManifestPayload
): Promise<Response2<UpgradeManifestResponse>> =>
  await HttpService.root(DOCUMENT_UPGRADE_ENDPOINT).post({
    entity: payload,
    urlReplacements: { '{id}': id },
  });

const listHistory = async (id: number): Promise<Response2<DocumentHistoryGetResponse>> =>
  await HttpService.root(DOCUMENT_HISTORY_ENDPOINT).get2({
    urlReplacements: { '{id}': id.toString() },
  });

const saveVersion = async (
  id: number,
  payload: CreateSavedDocVersionPayload
): Promise<Response2<CreateSavedDocVersionResponsePayload>> =>
  await HttpService.root(DOCUMENT_VERSIONS_ENDPOINT).post({
    entity: payload,
    urlReplacements: { '{docId}': id.toString() },
  });

const markSubmitted = async (
  docId: number,
  versionId: number,
  payload: UpdateSavedDocVersionPayload
): Promise<Response2<UpdateDocumentResponse>> =>
  await HttpService.root(DOCUMENT_VERSION_ENDPOINT).put({
    entity: payload,
    urlReplacements: { '{docId}': docId.toString(), '{versionId}': versionId.toString() },
  });

const DocumentService = {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  upgradeManifest,
  listHistory,
  saveVersion,
  markSubmitted,
};

export default DocumentService;
