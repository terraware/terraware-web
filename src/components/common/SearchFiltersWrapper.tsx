import React, { useMemo, useState } from 'react';
import { Box, Grid, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, PillList, Textfield, Tooltip } from '@terraware/web-components';
import { FieldOptionsMap } from 'src/types/Search';
import strings from 'src/strings';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import useDeviceInfo from 'src/utils/useDeviceInfo';

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

export type SearchFiltersProps = {
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  filterOptions: FieldOptionsMap;
  filterColumns: FilterField[];
};

export type SearchProps = SearchInputProps & {
  filtersProps?: SearchFiltersProps;
};

export default function Search({ search, onSearch, filtersProps }: SearchProps): JSX.Element {
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

            return {
              id: key,
              label: filtersProps.filterColumns.find((f) => key === f.name)?.label ?? '',
              value: filtersProps.filters[key].values.join(', '),
              onRemove: () => removeFilter(key),
            };
          })
        : [],
    [filtersProps]
  );

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
