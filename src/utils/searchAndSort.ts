import {
  SearchNodePayload,
  SearchSortOrder,
  isAndNodePayload,
  isFieldNodePayload,
  isNotNodePayload,
  isOrNodePayload,
} from 'src/types/Search';

export type SearchOrderConfig = {
  locale: string | null;
  sortOrder: SearchSortOrder;
  numberFields?: string[];
};

export const splitTrigrams = (value: string): string[] => {
  const trigrams = [];
  let position;

  // Remove non-alphanumeric characters
  const _value = value.replace(/[^0-9a-z]/gi, ' ').replace(/\s+/, ' ');

  // Split into words, pad each word with spaces
  const words = _value.split(' ').map((word) => ` ${word} `);

  for (const word of words) {
    position = 3;
    // For some reason the postgres implementation also includes the first 2 characters of each word
    trigrams.push(word.substring(0, 2));

    // Split the words into trigrams
    for (let i = 0; i < word.length; i += 1) {
      if (position <= word.length) {
        trigrams.push(word.substring(i, position).toLowerCase());
        position += 1;
      }
    }
  }

  return trigrams;
};

const searchConditionMet = <T extends Record<string, unknown>>(result: T, condition: SearchNodePayload): boolean => {
  // `as SearchNodePayload` casts below are because the SearchNodePayload in the generated types only has `operation`
  // The the union type from our types has the correct properties
  if (isNotNodePayload(condition)) {
    return !searchConditionMet(result, condition.child as SearchNodePayload);
  } else if (isAndNodePayload(condition)) {
    return (condition.children as SearchNodePayload[]).every((_condition) => searchConditionMet(result, _condition));
  } else if (isOrNodePayload(condition)) {
    return (condition.children as SearchNodePayload[]).some((_condition) => searchConditionMet(result, _condition));
  } else if (isFieldNodePayload(condition)) {
    // Only 'Exact' and 'Fuzzy' condition types are supported
    // `null` values (XYZ field contains no value) are also not supported
    const resultValue = `${result[condition.field]}`.toLowerCase();
    const searchValues = condition.values
      .filter((value: string | null): value is string => value !== null)
      .map((value) => value.toLowerCase());

    if (condition.type === 'Exact') {
      return searchValues.some((value) => resultValue.includes(value));
    } else if (condition.type === 'Fuzzy') {
      return searchValues.some((value) => {
        // Split the search value into trigrams and see if the result field contains any trigram
        const trigrams = splitTrigrams(value);
        return trigrams.some((trigram: string) => resultValue.includes(trigram));
      });
    }
  }

  // This is not possible unless new node types are introduced
  return false;
};

// Try to get the `*(raw)` field if it exists, otherwise fall back to the regular field
const getRawField = <T extends Record<string, unknown>>(result: T, field: string): unknown | undefined => {
  const fallback = [result[`${field}(raw)`], result[field], 0];
  for (const value of fallback) {
    if (value !== undefined) {
      return value;
    }
  }
};

export const sortResults = <T extends Record<string, unknown>>(
  results: T[],
  locale: string | null,
  sortOrder: SearchSortOrder,
  numberFields?: string[]
) => {
  const field = sortOrder.field;
  // Defaults to ascending if not provided
  const isDescending = sortOrder.direction === 'Descending';
  const isNumberField = (numberFields || []).includes(field);

  if (isNumberField) {
    results = results.sort((a, b) => Number(getRawField(a, field)) - Number(getRawField(b, field)));
  } else {
    results = results.sort((a, b) => `${a[field] || ''}`.localeCompare(`${b[field] || ''}`, locale || undefined));
  }

  if (isDescending) {
    results.reverse();
  }

  return results;
};

export type SearchAndSortFn<T extends Record<string, unknown>> = (
  results: T[],
  search?: SearchNodePayload,
  sortOrderConfig?: SearchOrderConfig
) => T[];
/**
 * In-memory search (filter) and sort on a result list using the Search API search and sortOrder interfaces
 * The search currently only supports `Exact` and 'Fuzzy' type searches, 'Range' and 'ExactOrFuzzy' are not supported
 * If the result type contains number fields, those must be supplied in the `sortOrderConfig` if you wish to sort on them
 * @param results         The list of results you want to search and sort
 * @param search          (optional) The SearchNodePayload which contains filter conditions to apply to the results
 * @param sortOrderConfig (optional) The sort order configuration contains:
 *    - a `locale`, used for sorting strings,
 *    - the `sortOrder` which defines the field and order
 *    - (optional) a list of `numberFields`, used to sort applicable fields numerically
 *      - fields not supplied will be sorted as strings
 *      - can be used to cast a string to a number, useful for SearchElementResponse numbers which come back as strings
 */
export const searchAndSort = <T extends Record<string, unknown>>(
  results: T[],
  search?: SearchNodePayload,
  sortOrderConfig?: SearchOrderConfig
): T[] => {
  let _results = [...results];

  if (search) {
    _results = _results.filter((result: T) => searchConditionMet(result, search));
  }

  if (sortOrderConfig) {
    const { locale, sortOrder, numberFields } = sortOrderConfig;
    _results = sortResults(_results, locale, sortOrder, numberFields);
  }

  return _results;
};

export type SearchNodeModifyConfig = {
  field: string;
  operation: 'APPEND' | 'REPLACE';
  values: string[];
  condition?: (values: string[]) => boolean;
};

/*
 * Modifies a search node tree according to a provided configuration. This allows us to do some fancy things like
 * filter for a specific thing that is not visible to the user, or modify searches where needed to provide extra
 * search functionality without adding too much complication too the consumer. Can be extended in the future to
 * change things like the search node's `operation`, `type`, or even add new children. For now just deals with
 * `values`.
 */
export const modifySearchNode = (
  modifyConfig: SearchNodeModifyConfig,
  search?: SearchNodePayload
): SearchNodePayload | undefined => {
  if (!search) {
    return search;
  }

  const { field, operation, values, condition } = modifyConfig;

  if (search.field === field) {
    if (condition && !condition(search.values)) {
      return search;
    }

    if (operation === 'APPEND') {
      return {
        ...search,
        values: [...search.values, ...values],
      };
    } else if (operation === 'REPLACE') {
      return {
        ...search,
        values: values,
      };
    }
  } else if (search.child) {
    const modifiedChild = modifySearchNode(modifyConfig, search.child);
    return {
      ...search,
      child: modifiedChild || search.child,
    };
  } else if (search.children) {
    return {
      ...search,
      children: search.children.map((child: SearchNodePayload) => modifySearchNode(modifyConfig, child)),
    };
  }

  return search;
};
