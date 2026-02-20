import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response2 } from 'src/services/HttpService';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
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
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

const DOCUMENTS_ENDPOINT = '/api/v1/document-producer/documents';
const DOCUMENT_ENDPOINT = '/api/v1/document-producer/documents/{id}';
const DOCUMENT_HISTORY_ENDPOINT = '/api/v1/document-producer/documents/{id}/history';
const DOCUMENT_VERSIONS_ENDPOINT = '/api/v1/document-producer/documents/{docId}/versions';
const DOCUMENT_VERSION_ENDPOINT = '/api/v1/document-producer/documents/{docId}/versions/{versionId}';
const DOCUMENT_UPGRADE_ENDPOINT = '/api/v1/document-producer/documents/{id}/upgrade';

type ListDocumentsResponsePayload =
  paths[typeof DOCUMENTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const createDocument = (payload: CreateDocumentPayload): Promise<Response2<CreateDocumentResponse>> =>
  HttpService.root(DOCUMENTS_ENDPOINT).post({ entity: payload });

const getDocument = (id: number): Promise<Response2<DocumentGetResponse>> =>
  HttpService.root(DOCUMENT_ENDPOINT).get2({
    urlReplacements: { '{id}': id.toString() },
  });

const getDocuments = (): Promise<Response2<DocumentListResponse>> => HttpService.root(DOCUMENTS_ENDPOINT).get2({});

const listHistory = (id: number): Promise<Response2<DocumentHistoryGetResponse>> =>
  HttpService.root(DOCUMENT_HISTORY_ENDPOINT).get2({
    urlReplacements: { '{id}': id.toString() },
  });

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

const searchDocuments = async (request: {
  locale: string | null;
  search: SearchNodePayload;
  searchSortOrder: SearchSortOrder;
}): Promise<ListDocumentsResponsePayload> => {
  const { locale, search, searchSortOrder } = request;
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder: searchSortOrder,
      numberFields: ['id'],
    };
  }

  const response = await HttpService.root(DOCUMENTS_ENDPOINT).get2<ListDocumentsResponsePayload>();

  if (!response || !response.requestSucceeded || !response.data) {
    return Promise.reject(response);
  }

  return {
    status: response.data.status,
    documents: searchAndSort(response.data.documents, search, searchOrderConfig),
  };
};

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
  getDocument,
  getDocuments,
  listHistory,
  markSubmitted,
  saveVersion,
  searchDocuments,
  updateDocument,
  upgradeManifest,
};

export default DocumentService;
