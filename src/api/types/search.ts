import { components, paths } from './generated-schema';

export const searchEndpoint = '/api/v1/seedbank/search';
export type SearchPostRequestBody = paths[typeof searchEndpoint]['post']['requestBody']['content']['application/json'];
export type SearchPostResponse = paths[typeof searchEndpoint]['post']['responses'][200]['content']['application/json'];

export const valuesEndpoint = '/api/v1/seedbank/values';
export type ValuesPostRequestBody = paths[typeof valuesEndpoint]['post']['requestBody']['content']['application/json'];
export type ValuesPostResponse = paths[typeof valuesEndpoint]['post']['responses'][200]['content']['application/json'];

export const valuesAllEndpoint = '/api/v1/seedbank/values/all';
export type ValuesAllPostRequestBody = paths[typeof valuesAllEndpoint]['post']['requestBody']['content']['application/json'];
export type ValuesAllPostResponse = paths[typeof valuesAllEndpoint]['post']['responses'][200]['content']['application/json'];

export type SearchField = components['schemas']['SearchField'];
export type SearchRequestPayload = components['schemas']['SearchRequestPayload'];
export type SearchFilter = components['schemas']['SearchFilter'];
export type SearchSortOrderElement = components['schemas']['SearchSortOrderElement'];
export type SearchResponsePayload = components['schemas']['SearchResponsePayload'];
export type SearchResponseResults = components['schemas']['SearchResponsePayload']['results'][0];

export type AndNodePayload = components['schemas']['AndNodePayload'] & {
  operation: 'and';
};
export type FieldNodePayload = components['schemas']['FieldNodePayload'] & {
  operation: 'field';
};
export type NotNodePayload = components['schemas']['NotNodePayload'] & {
  operation: 'not';
};
export type OrNodePayload = components['schemas']['OrNodePayload'] & {
  operation: 'or';
};
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;

export type FieldValuesPayload = {
  [key: string]: components['schemas']['FieldValuesPayload'];
};
