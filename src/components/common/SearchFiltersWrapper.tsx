import React, { useMemo, useState } from 'react';
import { Box, Grid, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, PillList, Textfield, Tooltip } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';
import { FieldOptionsMap, FieldValuesPayload, SearchNodePayload } from 'src/types/Search';
import strings from 'src/strings';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';

const useStyles = makeStyles((theme: Theme) => ({
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBaseGray300}`,
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
  options: number[];
  renderOption: (id: number) => string;
  searchNodeCreator: (values: (number | string | null)[]) => SearchNodePayload;
};

export type SearchFiltersProps = {
  filters: Record<string, SearchNodePayload>;
  setFilters: (filters: Record<string, any>) => void;
  filterOptions: FieldOptionsMap;
  filterColumns: FilterField[];
  optionsRenderer?: (filterName: string, values: FieldValuesPayload) => Option[] | undefined;
  pillValuesRenderer?: (filterName: string, values: unknown[]) => string | undefined;
};

export type SearchProps = SearchInputProps & {
  filtersProps?: SearchFiltersProps;
  featuredFilters?: FeaturedFilterConfig[];
};

export default function Search({ search, onSearch, filtersProps, featuredFilters }: SearchProps): JSX.Element {
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

            const pillValue =
              filtersProps.pillValuesRenderer && filtersProps.pillValuesRenderer(key, filtersProps.filters[key].values);

            let label = filtersProps.filterColumns.find((f) => key === f.name)?.label ?? '';
            if (!label) {
              label = (featuredFilters || []).find((ff: FeaturedFilterConfig) => ff.field === key)?.label ?? '';
            }

            return {
              id: key,
              label,
              value: pillValue ?? filtersProps.filters[key].values.join(', '),
              onRemove: () => removeFilter(key),
            };
          })
        : [],
    [filtersProps]
  );

  console.log('featuredFilters', featuredFilters);

  return (
    <>
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

            return (
              <FilterMultiSelectContainer
                key={index}
                disabled={featuredFilter.options.length === 0}
                filterKey={featuredFilter.field}
                filters={Object.keys(filtersProps.filters).reduce(
                  (acc, curr) => ({
                    ...acc,
                    [curr]: filtersProps.filters[curr].values,
                  }),
                  {} as Record<string, (number | null)[]>
                )}
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

                  console.log('nextFilters', nextFilters);
                  filtersProps.setFilters(nextFilters);
                }}
              />
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
                  noScroll={true}
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
    </>
  );
}
