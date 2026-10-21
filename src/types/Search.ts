import {
  AndNodePayload,
  FieldNodePayload,
  FieldValuesPayload as GeneratedFieldValuesPayload,
  NotNodePayload,
  OrNodePayload,
  PrefixedSearch,
  SearchApiArg,
  SearchResponsePayload,
  SearchSortOrderElement,
  SearchValuesResponsePayload,
} from 'src/queries/generated/search';

export type { AndNodePayload, FieldNodePayload, NotNodePayload, OrNodePayload, PrefixedSearch };
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: GeneratedFieldValuesPayload };
export type SearchCriteria = { [key: string]: SearchNodePayload };
export type SearchSortOrder = SearchSortOrderElement;
export type SearchType = FieldNodePayload['type'];
export type SearchResponseElement = SearchResponsePayload['results'][0];
export type SearchResponseElementWithId = SearchResponseElement & { id: string };
export type SearchValuesResponseElement = SearchValuesResponsePayload['results'];

export type FieldOptionsMap = { [key: string]: { partial: boolean; values: (string | null)[] } };

export type SearchRequestPayloadWithOptionalSearch = SearchApiArg;
/** Search request payload that requires a search node and result count to be specified. */
export type SearchRequestPayload = SearchApiArg & {
  count: number;
  search: SearchNodePayload;
};

export const isFieldNodePayload = (node: SearchNodePayload): node is FieldNodePayload => node.operation === 'field';
export const isNotNodePayload = (node: SearchNodePayload): node is NotNodePayload => node.operation === 'not';
export const isAndNodePayload = (node: SearchNodePayload): node is AndNodePayload => node.operation === 'and';
export const isOrNodePayload = (node: SearchNodePayload): node is OrNodePayload => node.operation === 'or';

export const getFieldNodeValues = (node?: SearchNodePayload): FieldNodePayload['values'] | undefined =>
  node && isFieldNodePayload(node) ? node.values : undefined;
export const getChildNodes = (node?: SearchNodePayload): SearchNodePayload[] | undefined =>
  node && (isAndNodePayload(node) || isOrNodePayload(node)) ? node.children : undefined;
