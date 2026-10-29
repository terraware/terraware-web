import { api } from '../generated/documentProducerDocuments';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listDocuments: {
      providesTags: (result) => [
        ...(result?.documents.map((document) => ({ type: QueryTagTypes.Documents, id: document.id })) ?? []),
        { type: QueryTagTypes.Documents, id: 'LIST' },
      ],
    },
    getDocument: {
      providesTags: (_result, _error, documentId) => [{ type: QueryTagTypes.Documents, id: documentId }],
    },
    getDocumentHistory: {
      providesTags: (_result, _error, documentId) => [{ type: QueryTagTypes.DocumentHistory, id: documentId }],
    },
  },
});
