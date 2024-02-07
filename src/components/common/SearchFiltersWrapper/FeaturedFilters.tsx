import React from 'react';
import { Box } from '@mui/material';
import theme from 'src/theme';
import { SearchNodePayload } from 'src/types/Search';
import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';
import { FeaturedFilterConfig } from './index';

interface FeaturedFiltersProps {
  featuredFilters: FeaturedFilterConfig[];
  setFilters: (filters: Record<string, any>) => void;
  allFilters: Record<string, SearchNodePayload>;
}

const FeaturedFilters = ({ featuredFilters, setFilters, allFilters }: FeaturedFiltersProps) => {
  return (
    <>
      {featuredFilters.map((featuredFilter: FeaturedFilterConfig, index: number) => {
        // Since we are using the same `filters` object across both featured and icon filters, we need to exclude
        // the icon filters when passing into the multi select container since it is only used with
        // numerical values and icon filters can be string values
        const filtersForFeaturedFilter = Object.keys(allFilters).reduce(
          (acc, curr) => {
            if (curr !== featuredFilter.field) {
              return acc;
            }
            return {
              ...acc,
              [curr]: allFilters[curr].values.map((value: string | number) => Number(value)),
            };
          },
          {} as Record<string, (number | null)[]>
        );

        return (
          <Box marginLeft={theme.spacing(2)} key={index}>
            <FilterMultiSelectContainer
              disabled={featuredFilter.options.length === 0}
              filterKey={featuredFilter.field}
              filters={filtersForFeaturedFilter}
              label={featuredFilter.label}
              options={featuredFilter.options}
              notPresentFilterLabel={featuredFilter.notPresentFilterLabel}
              notPresentFilterShown={featuredFilter.notPresentFilterShown}
              renderOption={featuredFilter.renderOption}
              setFilters={(fs: Record<string, (number | null)[]>) => {
                // Since the multi select is unaware of our Search API structure, convert the values back
                // to search nodes
                const nextFilters: Record<string, SearchNodePayload> = Object.keys(fs).reduce(
                  (acc, curr) => ({
                    ...acc,
                    [curr]: featuredFilter.searchNodeCreator(fs[curr]),
                  }),
                  {}
                );

                // Since this filter is only aware of featured filters, we need to recombine with the icon
                // filters when setting the filters in the implementer
                setFilters({
                  ...allFilters,
                  ...nextFilters,
                });
              }}
            />
          </Box>
        );
      })}
    </>
  );
};

export default FeaturedFilters;
