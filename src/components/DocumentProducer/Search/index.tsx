import React, { useMemo, useState } from 'react';

import { Grid, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Textfield } from '@terraware/web-components';
import { Tooltip } from '@terraware/web-components';
import { Button, PillList } from '@terraware/web-components';

import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBaseGray300}`,
      borderRadius: '8px',
      overflow: 'visible',
      width: '320px',
    },
  },
}));

export type SearchFiltersProp = {
  filterColumns: FilterField[];
  filterOptions: FieldOptionsMap;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
};

export type SearchProps = {
  // search
  searchValue: string;
  onSearch: (search: string) => void;

  // filters
  filterProps?: SearchFiltersProp;
};

const Search = ({ searchValue, onSearch, filterProps }: SearchProps): JSX.Element => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const filterPillData = useMemo(() => {
    if (!filterProps) {
      return [];
    }
    const { filters, filterColumns, setFilters } = filterProps;
    return Object.keys(filters).map((key) => {
      const removeFilter = (k: string) => {
        const result = { ...filters };
        delete result[k];
        setFilters(result);
      };

      return {
        id: key,
        label: filterColumns.find((f: any) => key === f.name)?.label ?? '',
        value: filters[key].values.join(', '),
        onRemove: () => removeFilter(key),
      };
    });
  }, [filterProps]);

  return (
    <Grid container>
      <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
        <Textfield
          placeholder={strings.SEARCH}
          iconLeft='search'
          label=''
          id='search'
          type='text'
          className={classes.searchField}
          iconRight='cancel'
          onClickRightIcon={() => onSearch('')}
          value={searchValue}
          onChange={(value: any) => onSearch(value as string)}
        />
        {filterProps && (
          <>
            <Tooltip title={strings.FILTER}>
              <Button
                id='filterNurseryWithdrawal'
                onClick={(event) => event && handleFilterClick(event)}
                type='passive'
                priority='ghost'
                icon='filter'
              />
            </Tooltip>
            <Popover
              id='simple-popover'
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
                initialFilters={filterProps.filters}
                fields={filterProps.filterColumns}
                values={filterProps.filterOptions}
                onConfirm={(fs) => {
                  handleFilterClose();
                  filterProps.setFilters(fs);
                }}
                onCancel={handleFilterClose}
              />
            </Popover>
          </>
        )}
      </Grid>
      <Grid item xs={12} display='flex'>
        <PillList data={filterPillData} />
      </Grid>
    </Grid>
  );
};

export default Search;
