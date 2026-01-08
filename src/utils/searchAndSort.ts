import {
  SearchNodePayload,
  SearchSortOrder,
  isAndNodePayload,
  isFieldNodePayload,
  isNotNodePayload,
  isOrNodePayload,
} from 'src/types/Search';

import { phraseMatch, removeDoubleQuotes } from './search';

export type SearchOrderConfig = {
  locale: string | null;
  sortOrder: SearchSortOrder;
  numberFields?: string[];
};

// This is the default used in Postgres
const TRIGRAM_SIMILARITY_THRESHOLD = 0.3;

export const splitTrigrams = (value: string): Set<string> => {
  const trigrams = [];
  let position;

  // Remove non-alphanumeric characters
  const _value = value.replace(/[^0-9a-z]/gi, ' ').replace(/\s+/, ' ');

  // Split into words, pad each word with spaces, two at the front per Postgres
  const words = _value.split(' ').map((word) => `  ${word} `);

  for (const word of words) {
    position = 3;
    // Split the words into trigrams
    for (let i = 0; i < word.length; i += 1) {
      if (position <= word.length) {
        trigrams.push(word.substring(i, position).toLowerCase());
        position += 1;
      }
    }
  }

  trigrams.sort();
  return new Set(trigrams);
};

const levenshtein = (a: string, b: string): number => {
  const matrix = [];

  // Create a matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Populate the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          ) // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export const trigramWordSimilarity = (a: string, b: string) => {
  const aTrigrams = splitTrigrams(a);
  const bTrigrams = splitTrigrams(b);

  if (aTrigrams.size === 0 || bTrigrams.size === 0) {
    return 0;
  }

  // Convert Set to Array
  const aTrigramArray = Array.from(aTrigrams);
  const matches = aTrigramArray.filter((trigram) => bTrigrams.has(trigram));

  // Adjust similarity calculation
  const similarity = matches.length / Math.max(aTrigrams.size, bTrigrams.size);
  return similarity;
};

export const fuzzyMatch = (a: string, b: string) => {
  const maxDistance = 1; // Allow one character difference

  // Normalize for case-insensitivity
  const normalizedA = a.toLowerCase();
  const normalizedB = b.toLowerCase();

  // Check for direct substring matches first
  if (normalizedB.includes(normalizedA)) {
    return true;
  }

  // Calculate Levenshtein distance
  const distance = levenshtein(normalizedA, normalizedB);
  return distance <= maxDistance || trigramWordSimilarity(a, b) > TRIGRAM_SIMILARITY_THRESHOLD;
};

const searchConditionMet = <T extends Record<string, unknown>>(result: T, condition: SearchNodePayload): boolean => {
  // `as SearchNodePayload` casts below are because the SearchNodePayload in the generated types only has `operation`
  // The union type from our types has the correct properties
  if (isNotNodePayload(condition)) {
    return !searchConditionMet(result, condition.child as SearchNodePayload);
  } else if (isAndNodePayload(condition)) {
    return (condition.children as SearchNodePayload[]).every((_condition) => searchConditionMet(result, _condition));
  } else if (isOrNodePayload(condition)) {
    return (condition.children as SearchNodePayload[]).some((_condition) => searchConditionMet(result, _condition));
  } else if (isFieldNodePayload(condition)) {
    // check for "." in field, attempt to do a nested property search if exists
    if (condition.field.includes('.')) {
      // split on "." to figure out how to process from there
      const index = condition.field.indexOf('.');
      const first = condition.field.substring(0, index);
      const last = condition.field.substring(index + 1);
      const firstResult = result[first];

      if (Array.isArray(firstResult)) {
        return firstResult.some((subItem) =>
          searchConditionMet(subItem, {
            ...condition,
            field: last,
          })
        );
      } else if (typeof firstResult === 'object') {
        return searchConditionMet(firstResult as Record<string, unknown>, {
          ...condition,
          field: last,
        });
      }

      // don't return false here, in case the field actually just has an "." in it instead of representing a sub-property
    }

    // Only 'Exact', 'Fuzzy', and 'Range' condition types are supported
    // `null` values (XYZ field contains no value) are also not supported for Exact and Fuzzy
    const resultValue = `${result[condition.field] as string}`.toLowerCase();
    const searchValues = condition.values
      .filter((value: string | null): value is string => value !== null)
      .map((value) => value.toLowerCase());

    const exactValues = searchValues.map(removeDoubleQuotes).filter((value) => value !== null);
    if (exactValues.length) {
      return exactValues.some((value) => value !== null && phraseMatch(resultValue, value));
    }

    if (condition.type === 'Exact') {
      return searchValues.some((value) => resultValue === value);
    } else if (condition.type === 'Fuzzy') {
      return searchValues.some((searchValue) => {
        // Trigrams don't work with single letter searches
        if (searchValue.length === 1) {
          return resultValue.includes(searchValue);
        }
        return fuzzyMatch(searchValue, resultValue);
      });
    } else if (condition.type === 'Range') {
      // Range requires exactly two values: [min, max]
      if (condition.values.length !== 2) {
        return false;
      }

      const [minValue, maxValue] = condition.values;
      const fieldValue = result[condition.field];

      const fieldDate = new Date(fieldValue as string);

      if (!isNaN(fieldDate.getTime())) {
        const minDate = minValue ? new Date(minValue) : null;
        const maxDate = maxValue ? new Date(maxValue) : null;

        if (minDate && !isNaN(minDate.getTime()) && fieldDate < minDate) {
          return false;
        }
        if (maxDate && !isNaN(maxDate.getTime()) && fieldDate > maxDate) {
          return false;
        }
        return true;
      }

      const fieldNumber = Number(fieldValue);
      if (isNaN(fieldNumber)) {
        return false;
      }

      const minNumber = minValue ? Number(minValue) : null;
      const maxNumber = maxValue ? Number(maxValue) : null;

      if (minNumber !== null && fieldNumber < minNumber) {
        return false;
      }
      if (maxNumber !== null && fieldNumber > maxNumber) {
        return false;
      }
      return true;
    }
  }

  // This is not possible unless new node types are introduced
  return false;
};

// Try to get the `*(raw)` field if it exists, otherwise fall back to the regular field
const getRawField = <T extends Record<string, unknown>>(result: T, field: string): unknown => {
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

  // Create array with original indices to maintain stable sort
  const indexedResults = results.map((item, index) => ({ item, index }));

  if (isNumberField) {
    indexedResults.sort((a, b) => {
      const comparison = Number(getRawField(a.item, field)) - Number(getRawField(b.item, field));
      return comparison !== 0 ? comparison : a.index - b.index;
    });
  } else {
    indexedResults.sort((a, b) => {
      const comparison = String(a.item[field] || '').localeCompare(String(b.item[field] || ''), locale || undefined);
      return comparison !== 0 ? comparison : a.index - b.index;
    });
  }

  results = indexedResults.map(({ item }) => item);

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
 * The search currently supports `Exact`, 'Fuzzy', and 'Range' type searches. 'ExactOrFuzzy' is not supported
 * Range searches work with dates and numbers, automatically detecting the field type
 * If the result type contains number fields, those must be supplied in the `sortOrderConfig` if you wish to sort on them
 * @param results         The list of results you want to search and sort
 * @param search          (optional) The SearchNodePayload which contains filter conditions to apply to the results
 * @param sortOrderConfig (optional) The sort order configuration contains:
 * ```md
 *    - a `locale`, used for sorting strings,
 *    - the `sortOrder` which defines the field and order
 *    - (optional) a list of `numberFields`, used to sort applicable fields numerically
 *      - fields not supplied will be sorted as strings
 *      - can be used to cast a string to a number, useful for SearchElementResponse numbers which come back as strings
 * ```
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
        values,
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
