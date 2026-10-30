import HttpService, { Response2 } from 'src/services/HttpService';
import {
  CreateDocumentPayload,
  CreateDocumentResponse,
  CreateSavedDocVersionPayload,
  CreateSavedDocVersionResponsePayload,
  UpdateDocumentPayload,
  UpdateDocumentResponse,
  UpdateSavedDocVersionPayload,
  UpgradeManifestPayload,
  UpgradeManifestResponse,
} from 'src/types/documentProducer/Document';

const DOCUMENTS_ENDPOINT = '/api/v1/document-producer/documents';
const DOCUMENT_ENDPOINT = '/api/v1/document-producer/documents/{id}';
const DOCUMENT_VERSIONS_ENDPOINT = '/api/v1/document-producer/documents/{docId}/versions';
const DOCUMENT_VERSION_ENDPOINT = '/api/v1/document-producer/documents/{docId}/versions/{versionId}';
const DOCUMENT_UPGRADE_ENDPOINT = '/api/v1/document-producer/documents/{id}/upgrade';

const createDocument = (payload: CreateDocumentPayload): Promise<Response2<CreateDocumentResponse>> =>
  HttpService.root(DOCUMENTS_ENDPOINT).post({ entity: payload });

const markSubmitted = (
  docId: number,
  versionId: number,
  payload: UpdateSavedDocVersionPayload
): Promise<Response2<UpdateDocumentResponse>> =>
  HttpService.root(DOCUMENT_VERSION_ENDPOINT).put({
    entity: payload,
    urlReplacements: { '{docId}': docId.toString(), '{versionId}': versionId.toString() },
  });

const saveVersion = (
  id: number,
  payload: CreateSavedDocVersionPayload
): Promise<Response2<CreateSavedDocVersionResponsePayload>> =>
  HttpService.root(DOCUMENT_VERSIONS_ENDPOINT).post({
    entity: payload,
    urlReplacements: { '{docId}': id.toString() },
  });

const updateDocument = (id: number, payload: UpdateDocumentPayload): Promise<Response2<UpdateDocumentResponse>> =>
  HttpService.root(DOCUMENT_ENDPOINT).put({
    entity: payload,
    urlReplacements: { '{id}': id.toString() },
  });

const upgradeManifest = (id: string, payload: UpgradeManifestPayload): Promise<Response2<UpgradeManifestResponse>> =>
  HttpService.root(DOCUMENT_UPGRADE_ENDPOINT).post({
    entity: payload,
    urlReplacements: { '{id}': id },
  });

const DocumentService = {
  createDocument,
  markSubmitted,
  saveVersion,
  updateDocument,
  upgradeManifest,
};

export default DocumentService;
