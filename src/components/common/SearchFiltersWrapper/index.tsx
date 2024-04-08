import React, { useMemo } from 'react';

import { Box, Grid } from '@mui/material';
import { PillList, Textfield } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';

import { FilterField } from 'src/components/common/FilterGroup';
import strings from 'src/strings';
import { FieldOptionsMap, FieldValuesPayload, SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import FeaturedFilters from './FeaturedFilters';
import IconFilters from './IconFilters';

export type SearchInputProps = {
  search: string;
  onSearch: (search: string) => void;
};

/**
 * A "featured filter" is one that resides within its own multi select, between the search bar and the filters hidden
 * behind the filter icon (those are now called "icon filters"). Since the implementer should not care about where the
 * filters are (featured or icon), the `filtersProps.setFilters` and `filterProps.filters` passed in are really used to
 * control "all filters". Ideally the SearchFiltersProps gets turned into IconFiltersProps, and those two aforementioned
 * properties get put at the top level of the SearchProps, to make it more obvious. That is a slightly bigger refactor
 * than I want to embark on right now since there are a good number of places using this component. One side effect of
 * this is that **you can't use featured filters without the icon filters also being set up.** As soon as we decide to
 * implement this wrapper with only the featured filters, it makes sense to do the refactor. Hopefully this note
 * clears up any confusion and serves as a reminder that we should do that in the future.
 *
 * The types might look like this:
 * type FeaturedFilterConfig - unchanged
 *
 * type IconFilters = {
 *   filterOptions: FieldOptionsMap;
 *   filterColumns: FilterField[];
 *   optionsRenderer?: (filterName: string, values: FieldValuesPayload) => Option[] | undefined;
 *   noScroll?: boolean;
 * }
 *
 * type SearchProps = SearchInputProps & {
 *   iconFilters?: IconFilters[];
 *   featuredFilters?: FeaturedFilterConfig[];
 *   currentFilters: Record<string, SearchNodePayload>;
 *   setCurrentFilters: (filters: Record<string, any>) => void;
 * };
 *
 */
export type FeaturedFilterConfig = {
  field: string;
  label: string;
  notPresentFilterLabel?: string;
  notPresentFilterShown?: boolean;
  options: (number | string)[];
  renderOption: (id: string | number) => string;
  searchNodeCreator: (values: (number | string | null)[]) => SearchNodePayload;
  pillValuesRenderer: (values: unknown[]) => string | undefined;
};

export type SearchFiltersProps = {
  // Technically "all filters"
  filters: Record<string, SearchNodePayload>;
  // Technically "set all filters"
  setFilters: (filters: Record<string, any>) => void;
  // These props are specific to the filters hidden behind the filter icon
  filterOptions: FieldOptionsMap;
  filterColumns: FilterField[];
  optionsRenderer?: (filterName: string, values: FieldValuesPayload) => Option[] | undefined;
  noScroll?: boolean;
};

export type SearchProps = SearchInputProps & {
  filtersProps?: SearchFiltersProps;
  featuredFilters?: FeaturedFilterConfig[];
};

export default function SearchFiltersWrapper({
  search,
  onSearch,
  filtersProps,
  featuredFilters,
}: SearchProps): JSX.Element {
  const { isMobile } = useDeviceInfo();

  const filterPillData = useMemo(
    () =>
      filtersProps
        ? Object.keys(filtersProps.filters).map((key) => {
            const removeFilter = (k: string) => {
              const result = { ...filtersProps.filters };
              delete result[k];
              filtersProps.setFilters(result);
            };

            let pillValue: string | undefined = filtersProps.filters[key]?.values.join(', ');
            let label = filtersProps.filterColumns.find((f) => key === f.name)?.label ?? '';

            // If the filter is coming from a featured filter, the pill value and label will come from featuredFilters
            if (featuredFilters) {
              const featuredFilter = featuredFilters.find((ff) => ff.field === key);
              if (featuredFilter) {
                pillValue = featuredFilter.pillValuesRenderer(filtersProps.filters[key].values);
                label = featuredFilter.label;
              }
            }

            return {
              id: key,
              label,
              value: pillValue || '',
              onRemove: () => removeFilter(key),
            };
          })
        : [],
    [featuredFilters, filtersProps]
  );

  return (
    <Grid container>
      <Grid item xs={12} display='flex' alignItems='center'>
        <Box width={isMobile ? '200px' : '300px'} display='inline-flex' flexDirection='column'>
          <Textfield
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={(val) => onSearch(val as string)}
            value={search}
            iconRight='cancel'
            onClickRightIcon={() => onSearch('')}
          />
        </Box>

        {featuredFilters && filtersProps && (
          <FeaturedFilters
            featuredFilters={featuredFilters}
            setFilters={filtersProps.setFilters}
            allFilters={filtersProps.filters}
          />
        )}

        {filtersProps && <IconFilters filtersProps={filtersProps} />}
      </Grid>

      {filterPillData.length > 0 && (
        <Grid item xs={12} display='flex' marginTop={1}>
          <PillList data={filterPillData} />
        </Grid>
      )}
    </Grid>
  );
}
