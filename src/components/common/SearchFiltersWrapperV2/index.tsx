import React, { ReactNode, useCallback, useMemo } from 'react';

import { Box, Grid } from '@mui/material';
import { PillList, PillListItem, Textfield } from '@terraware/web-components';

import { FilterField } from 'src/components/common/FilterGroup';
import strings from 'src/strings';
import { SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import FeaturedFilters from './FeaturedFilters';
import IconFilters from './IconFilters';

export type SearchInputProps = {
  search: string;
  searchPlaceholder?: string;
  onSearch: (search: string) => void;
};

export type FilterConfig = {
  field: string;
  label: string;
  notPresentFilterLabel?: string;
  notPresentFilterShown?: boolean;
  options: (number | string | null)[];
  pillValueRenderer?: (values: (string | number | null)[]) => string | undefined;
  renderOption?: (id: string | number) => string;
  searchNodeCreator?: (values: (string | number | null)[]) => SearchNodePayload;
  showLabel?: boolean;
  type?: FilterField['type'];
};

export type SearchProps = SearchInputProps & {
  iconFilters?: FilterConfig[];
  featuredFilters?: FilterConfig[];
  currentFilters: Record<string, SearchNodePayload>;
  setCurrentFilters: (filters: Record<string, SearchNodePayload>) => void;
  rightComponent?: ReactNode;
};

const defaultPillValueRenderer = (values: (string | number | null)[]): string | undefined => values.join(', ');

export default function SearchFiltersWrapperV2({
  search,
  searchPlaceholder,
  onSearch,
  iconFilters,
  featuredFilters,
  currentFilters,
  setCurrentFilters,
  rightComponent,
}: SearchProps): JSX.Element {
  const { isMobile } = useDeviceInfo();

  const filterPillData = useMemo(
    () =>
      Object.keys(currentFilters)
        .map((key): PillListItem<string> | false => {
          // If there are no values, there should be no pill
          if (!currentFilters[key] || (currentFilters[key].values || []).length === 0) {
            return false;
          }

          const filterConfig = [...(iconFilters || []), ...(featuredFilters || [])].find(
            (filter: FilterConfig) => filter.field === key
          );

          if (!filterConfig) {
            // Should not be possible, a filter must be present in either icon filters or featured filters
            return false;
          }

          const pillValue = filterConfig.pillValueRenderer
            ? filterConfig.pillValueRenderer(currentFilters[key].values)
            : defaultPillValueRenderer(currentFilters[key].values);
          const label = filterConfig.label;

          const removeFilter = (k: string) => {
            const result = { ...currentFilters };
            delete result[k];
            setCurrentFilters(result);
          };

          return {
            id: key,
            label,
            value: pillValue || '',
            onRemove: () => removeFilter(key),
          };
        })
        .filter((item: PillListItem<string> | false): item is PillListItem<string> => !!item),
    [currentFilters, iconFilters, featuredFilters, setCurrentFilters]
  );

  // Since we have two different places filters can exist, we need to combine them before setting in the consumer
  const setFilters = useCallback(
    (incomingFilters: Record<string, SearchNodePayload>) => {
      setCurrentFilters({
        ...currentFilters,
        ...incomingFilters,
      });
    },
    [currentFilters, setCurrentFilters]
  );

  return (
    <Grid container>
      <Grid item xs={12} display='flex' alignItems='center'>
        <Box width={isMobile ? '200px' : '300px'} display='inline-flex' flexDirection='column'>
          <Textfield
            placeholder={searchPlaceholder || strings.SEARCH}
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

        {featuredFilters && (
          <FeaturedFilters filters={featuredFilters} setCurrentFilters={setFilters} currentFilters={currentFilters} />
        )}

        {iconFilters && (
          <IconFilters filters={iconFilters} setCurrentFilters={setFilters} currentFilters={currentFilters} />
        )}

        {rightComponent}
      </Grid>

      {filterPillData.length > 0 && (
        <Grid item xs={12} display='flex' marginTop={1}>
          <PillList data={filterPillData} />
        </Grid>
      )}
    </Grid>
  );
}
