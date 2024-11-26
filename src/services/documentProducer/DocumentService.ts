import HttpService, { Response2 } from 'src/services/HttpService';
import { SearchNodePayload, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import {
  CreateDocumentPayload,
  CreateDocumentResponse,
  CreateSavedDocVersionPayload,
  CreateSavedDocVersionResponsePayload,
  Document,
  DocumentGetResponse,
  DocumentHistoryGetResponse,
  DocumentListResponse,
  UpdateDocumentPayload,
  UpdateDocumentResponse,
  UpdateSavedDocVersionPayload,
  UpgradeManifestPayload,
  UpgradeManifestResponse,
} from 'src/types/documentProducer/Document';

import SearchService from '../SearchService';

const DOCUMENTS_ENDPOINT = '/api/v1/document-producer/documents';
const DOCUMENT_ENDPOINT = '/api/v1/document-producer/documents/{id}';
const DOCUMENT_HISTORY_ENDPOINT = '/api/v1/document-producer/documents/{id}/history';
const DOCUMENT_VERSIONS_ENDPOINT = '/api/v1/document-producer/documents/{docId}/versions';
const DOCUMENT_VERSION_ENDPOINT = '/api/v1/document-producer/documents/{docId}/versions/{versionId}';
const DOCUMENT_UPGRADE_ENDPOINT = '/api/v1/document-producer/documents/{id}/upgrade';

const DOCUMENTS_SEARCH_FIELDS = [
  'createdTime',
  'documentTemplate_id',
  'documentTemplate_name',
  'id',
  'lastSavedVersionId',
  'modifiedTime',
  'name',
  'project_id',
  'project_name',
  'status',
];

export type DocumentsSearchResponseElement = {
  createdTime: string;
  documentTemplate_id: number;
  documentTemplate_name: string;
  id: number;
  lastSavedVersionId?: number;
  modifiedTime: string;
  name: string;
  project_id: number;
  project_name: string;
  status: Document['status'];
};

const createDocument = (payload: CreateDocumentPayload): Promise<Response2<CreateDocumentResponse>> =>
  HttpService.root(DOCUMENTS_ENDPOINT).post({ entity: payload });

const getDocument = (id: number): Promise<Response2<DocumentGetResponse>> =>
  HttpService.root(DOCUMENT_ENDPOINT).get2({
    urlReplacements: { '{id}': id.toString() },
  });

const getDocuments = (): Promise<Response2<DocumentListResponse>> => HttpService.root(DOCUMENTS_ENDPOINT).get2({});

const getSearchParams = (search?: SearchNodePayload, sortOrder?: SearchSortOrder): SearchRequestPayload => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.documents',
    fields: DOCUMENTS_SEARCH_FIELDS,
    search: {
      operation: 'and',
      children: search ? [search] : [],
    },
    sortOrder: [sortOrder ?? { field: 'name' }],
    count: 1000,
  };

  return searchParams;
};

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
}): Promise<DocumentsSearchResponseElement[]> => {
  const response = await SearchService.search(getSearchParams(request.search, request.searchSortOrder));
  return (response || []).map(
    (value: SearchResponseElement): DocumentsSearchResponseElement => ({
      createdTime: `${value.createdTime}`,
      documentTemplate_id: Number(value.documentTemplate_id),
      documentTemplate_name: `${value.documentTemplate_name}`,
      id: Number(value.id),
      lastSavedVersionId: value.lastSavedVersionId ? Number(value.lastSavedVersionId) : undefined,
      modifiedTime: `${value.modifiedTime}`,
      name: `${value.name}`,
      project_id: Number(value.project_id),
      project_name: `${value.project_name}`,
      status: `${value.status}` as Document['status'],
    })
  );
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
