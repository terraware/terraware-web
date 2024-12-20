import React, { useMemo } from 'react';

import { Box } from '@mui/material';

import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';
import theme from 'src/theme';
import { SearchNodePayload } from 'src/types/Search';

import { FilterConfig } from './index';

interface FeaturedFiltersProps {
  filters: FilterConfig[];
  setCurrentFilters: (filters: Record<string, any>) => void;
  currentFilters: Record<string, SearchNodePayload>;
  onFilterApplied?: (filter: string, values: (string | number | null)[]) => void;
}

type MultiSelectFilters = Record<string, (string | number | null)[]>;

export const defaultSearchNodeCreator = (field: string, values: (number | string | null)[]) =>
  ({
    field,
    operation: 'field',
    type: 'Exact',
    values: values.map((value: number | string | null): string | null => (value === null ? value : `${value}`)),
  }) as SearchNodePayload;

const defaultRenderOption = (status: string | number) => `${status}`;

const FeaturedFilters = ({ filters, setCurrentFilters, currentFilters, onFilterApplied }: FeaturedFiltersProps) => {
  // Since the multi select should stay unaware of our Search API structure, convert the filters to multi select filters
  const multiSelectFilters = useMemo(
    () =>
      filters.reduce(
        (acc: MultiSelectFilters, filter: FilterConfig): MultiSelectFilters => ({
          ...acc,
          [filter.field]: currentFilters[filter.field] ? currentFilters[filter.field].values : [],
        }),
        {} as MultiSelectFilters
      ),
    [currentFilters, filters]
  );

  return (
    <>
      {filters.map((filter: FilterConfig, index: number) => {
        return (
          <Box marginLeft={theme.spacing(2)} key={index}>
            <FilterMultiSelectContainer
              disabled={filter.options.length === 0}
              filterKey={filter.field}
              filters={multiSelectFilters}
              label={filter.label}
              options={filter.options.filter((option): option is string | number => !!option)}
              notPresentFilterLabel={filter.notPresentFilterLabel}
              notPresentFilterShown={filter.notPresentFilterShown}
              renderOption={filter.renderOption ? filter.renderOption : defaultRenderOption}
              setFilters={(fs: MultiSelectFilters) => {
                // Since the multi select should stay unaware of our Search API structure, convert the values back
                // to search nodes
                const nextFilters: Record<string, SearchNodePayload> = Object.keys(fs).reduce((acc, curr) => {
                  if (filter.field === curr) {
                    return {
                      ...acc,
                      [curr]: filter.searchNodeCreator
                        ? filter.searchNodeCreator(fs[curr])
                        : defaultSearchNodeCreator(curr, fs[curr]),
                    };
                  } else {
                    return acc;
                  }
                }, {});

                setCurrentFilters(nextFilters);
              }}
              onFilterApplied={onFilterApplied}
            />
          </Box>
        );
      })}
    </>
  );
};

export default FeaturedFilters;
