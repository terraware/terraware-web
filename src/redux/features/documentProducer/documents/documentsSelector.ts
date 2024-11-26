/* eslint-disable @typescript-eslint/no-unused-vars */
import createCachedSelector from 're-reselect';

import { selectUsers } from 'src/redux/features/user/usersSelectors';
import { RootState } from 'src/redux/rootReducer';
import { User } from 'src/types/User';
import {
  DocumentHistoryCreatedPayload,
  DocumentHistoryEditedPayload,
  DocumentHistoryEvent,
  DocumentHistorySavedPayload,
} from 'src/types/documentProducer/Document';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import { getUserDisplayName } from 'src/utils/user';

import { AsyncRequest, AsyncRequestT } from '../../asyncUtils';

export const selectDocuments = (requestId: string) => (state: RootState) =>
  state.documentProducerDocumentList[requestId];

export const selectGetDocument =
  (docId: number) =>
  (state: RootState): AsyncRequestT<DocumentType> | undefined =>
    state.documentProducerDocument[docId];

export const selectListHistory = createCachedSelector(
  (state: RootState, id: number) => state.documentProducerDocumentListHistory[id],
  (state: RootState, id: number) => selectUsers(state),
  (response, users) => {
    if (response) {
      const usersMap =
        users?.reduce(
          (acc: Record<number, string>, curr: User | undefined) => {
            if (curr) {
              acc[curr.id] = getUserDisplayName(curr) || '';
            }
            return acc;
          },
          {} as Record<number, string>
        ) ?? {};

      return {
        ...response,
        data:
          response.data?.map(
            (event: DocumentHistorySavedPayload | DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload) => ({
              ...event,
              modifiedByName: usersMap[event.createdBy] ?? '',
            })
          ) ?? [],
      };
    } else {
      return response;
    }
  }
)((state: RootState, id: number) => id.toString());

type DocumentHistoryCreatedKeys = keyof DocumentHistoryCreatedPayload;
export const searchHistory = createCachedSelector(
  (state: RootState, id: number, query: string) => selectListHistory(state, id),
  (state: RootState, id: number, query: string) => id,
  (state: RootState, id: number, query: string) => query,
  (response, id, query) => {
    if (response?.data) {
      if (query) {
        const regex = new RegExp(query, 'i');
        const fields: DocumentHistoryCreatedKeys[] = ['modifiedByName' as DocumentHistoryCreatedKeys];
        return {
          ...response,
          data: response.data.reduce(
            (acc, curr: DocumentHistorySavedPayload | DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload) => {
              fields.some((field) => `${curr[field]}`.match(regex));
              return [...acc, { ...curr, docId: id }];
            },
            [] as DocumentHistoryEvent[]
          ),
        };
      } else {
        return {
          ...response,
          data: response.data.map(
            (event: DocumentHistorySavedPayload | DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload) => ({
              ...event,
              documentId: id,
            })
          ),
        };
      }
    }
  }
)((state: RootState, id: number, query: string) => query);

export const selectDocumentRequest = (requestId: string) => (state: RootState) =>
  state.documentProducerDocumentRequests[requestId];

export const selectDocumentSearch = (requestId: string) => (state: RootState) =>
  state.documentProducerDocumentSearch[requestId];
