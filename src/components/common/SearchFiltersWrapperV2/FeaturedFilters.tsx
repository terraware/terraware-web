import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import theme from 'src/theme';
import { SearchNodePayload } from 'src/types/Search';
import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';
import { FilterConfig } from './index';

interface FeaturedFiltersProps {
  filters: FilterConfig[];
  setCurrentFilters: (filters: Record<string, any>) => void;
  currentFilters: Record<string, SearchNodePayload>;
}

type MultiSelectFilters = Record<string, (string | number | null)[]>;

const defaultSearchNodeCreator = (field: string, values: (number | string | null)[]) => ({
  field,
  operation: 'field',
  type: 'Exact',
  values: values.map((value: number | string | null): string | null => (value === null ? value : `${value}`)),
});

const defaultRenderOption = (status: string | number) => `${status}`;

const FeaturedFilters = ({ filters, setCurrentFilters, currentFilters }: FeaturedFiltersProps) => {
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
                const nextFilters: Record<string, SearchNodePayload> = Object.keys(fs).reduce(
                  (acc, curr) => ({
                    ...acc,
                    [curr]: filter.searchNodeCreator
                      ? filter.searchNodeCreator(fs[curr])
                      : defaultSearchNodeCreator(curr, fs[curr]),
                  }),
                  {}
                );

                setCurrentFilters(nextFilters);
              }}
            />
          </Box>
        );
      })}
    </>
  );
};

export default FeaturedFilters;
