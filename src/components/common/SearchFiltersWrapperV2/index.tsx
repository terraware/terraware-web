import React, { useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import { PillList, PillListItem, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { SearchNodePayload } from 'src/types/Search';
import { FilterField } from 'src/components/common/FilterGroup';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import IconFilters from './IconFilters';
import FeaturedFilters from './FeaturedFilters';

export type SearchInputProps = {
  search: string;
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
  setCurrentFilters: (filters: Record<string, any>) => void;
};

const defaultPillValueRenderer = (values: (string | number | null)[]): string | undefined => values.join(', ');

export default function SearchFiltersWrapperV2({
  search,
  onSearch,
  iconFilters,
  featuredFilters,
  currentFilters,
  setCurrentFilters,
}: SearchProps): JSX.Element {
  const { isMobile } = useDeviceInfo();

  const filterPillData = useMemo(
    () =>
      Object.keys(currentFilters)
        .map((key): PillListItem<string> | false => {
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

        {featuredFilters && (
          <FeaturedFilters
            filters={featuredFilters}
            setCurrentFilters={setCurrentFilters}
            currentFilters={currentFilters}
          />
        )}

        {iconFilters && (
          <IconFilters filters={iconFilters} setCurrentFilters={setCurrentFilters} currentFilters={currentFilters} />
        )}
      </Grid>

      {filterPillData.length > 0 && (
        <Grid item xs={12} display='flex' marginTop={1}>
          <PillList data={filterPillData} />
        </Grid>
      )}
    </Grid>
  );
}
