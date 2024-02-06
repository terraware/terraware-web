import React, { useMemo, useState } from 'react';
import { Box, Grid, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, PillList, Textfield, Tooltip } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';
import strings from 'src/strings';
import theme from 'src/theme';
import { FieldOptionsMap, FieldValuesPayload, SearchNodePayload } from 'src/types/Search';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';

const useStyles = makeStyles((_theme: Theme) => ({
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${_theme.palette.TwClrBaseGray300}`,
      borderRadius: '8px',
      overflow: 'visible',
      width: '480px',
    },
  },
}));

export type SearchInputProps = {
  search: string;
  onSearch: (search: string) => void;
};

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
  filters: Record<string, SearchNodePayload>;
  setFilters: (filters: Record<string, any>) => void;
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
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

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

        {(featuredFilters || []).map((featuredFilter: FeaturedFilterConfig, index: number) => {
          if (!filtersProps) {
            return null;
          }

          // Since we are using the same `filters` object across both featured and regular filters, we need to exclude
          // the regular filters when passing into the multi select container since it is only used with
          // numerical values and regular filters can be string values
          const filtersForFeaturedFilter = Object.keys(filtersProps.filters).reduce(
            (acc, curr) => {
              if (curr !== featuredFilter.field) {
                return acc;
              }
              return {
                ...acc,
                [curr]: filtersProps.filters[curr].values.map((value: string | number) => Number(value)),
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
                  const nextFilters: Record<string, SearchNodePayload> = Object.keys(fs).reduce(
                    (acc, curr) => ({
                      ...acc,
                      [curr]: featuredFilter.searchNodeCreator(fs[curr]),
                    }),
                    {}
                  );

                  // Since this filter is only aware of featured filters, we need to recombine with the regular
                  // filters when setting the filters in the implementer
                  filtersProps.setFilters({
                    ...filtersProps.filters,
                    ...nextFilters,
                  });
                }}
              />
            </Box>
          );
        })}

        {filtersProps && (
          <>
            <Tooltip title={strings.FILTER}>
              <Button
                id='filter-observations-button'
                onClick={(event) => event && handleFilterClick(event)}
                type='passive'
                priority='ghost'
                icon='filter'
              />
            </Tooltip>
            <Popover
              id='observations-filter-popover'
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              className={classes.popoverContainer}
            >
              <FilterGroup
                initialFilters={filtersProps.filters}
                fields={filtersProps.filterColumns}
                values={filtersProps.filterOptions || {}}
                onConfirm={(fs) => {
                  handleFilterClose();
                  filtersProps.setFilters(fs);
                }}
                onCancel={handleFilterClose}
                noScroll={filtersProps.noScroll === undefined}
                optionsRenderer={filtersProps.optionsRenderer}
              />
            </Popover>
          </>
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
