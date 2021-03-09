import { components } from './generated-schema';

export type SearchField = components['schemas']['SearchField'];
export type SearchRequestPayload = components['schemas']['SearchRequestPayload'];
export type SearchFilter = components['schemas']['SearchFilter'];
export type SearchSortOrderElement = components['schemas']['SearchSortOrderElement'];
export type SearchResponsePayload = components['schemas']['SearchResponsePayload'];
export type SearchResponseResults = components['schemas']['SearchResponsePayload']['results'][0];

export type ListFieldValuesRequestPayload = components['schemas']['ListFieldValuesRequestPayload'];
export type ListFieldValuesResponsePayload = components['schemas']['ListFieldValuesResponsePayload'];
export type ListAllFieldValuesRequestPayload = components['schemas']['ListAllFieldValuesRequestPayload'];
export type ListAllFieldValuesResponsePayload = components['schemas']['ListAllFieldValuesResponsePayload'];
export type FieldValuesPayload = {
  [key: string]: components['schemas']['FieldValuesPayload'];
};
