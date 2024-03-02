import React, { useCallback, useMemo, useState } from 'react';

import { Box, Container, Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, PillList, PillListItem, Tooltip } from '@terraware/web-components';
import { DatabaseColumn, Option } from '@terraware/web-components/components/table/types';

import FilterGroup from 'src/components/common/FilterGroup';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';
import TextField from 'src/components/common/Textfield/Textfield';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { FieldValuesPayload, SearchNodePayload } from 'src/types/Search';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile?: boolean;
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    margin: theme.spacing(2, 0, 0, 0),
    padding: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  filtersContainer: {
    minHeight: '32px',
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column' : 'row'),
    flexWrap: (props: StyleProps) => (props.isMobile ? 'nowrap' : 'wrap'),
    alignItems: (props: StyleProps) => (props.isMobile ? 'flex-start' : 'center'),
    gap: theme.spacing(1),
    marginTop: `-${theme.spacing(1)}`,
    marginBottom: '8px',
  },
  searchField: {
    width: '300px',
    marginTop: theme.spacing(-0.5),
  },
  preExpFilterDropdown: {
    cursor: 'pointer',
    border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
    borderRadius: '4px',
    width: '176px',
    height: '40px',
    padding: theme.spacing(1, 2, 1, 1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  preExpFilterIconRight: {
    height: '24px',
    width: '24px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      overflow: 'visible',
      width: (props: StyleProps) => (props.isMobile ? '90%' : '480px'),
    },
  },
  mobileContainer: {
    borderRadius: '8px',
    overflow: 'visible',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90%',
    width: '90%',
    zIndex: 1300,
  },
  filterIconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    padding: 0,
  },
  filterIcon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
}));

const getSearchTermFromFilters = (filters: Record<string, SearchNodePayload>): string => {
  const filterValues = filters.searchTermFilter;
  return filterValues?.children[0]?.values[0] ?? '';
};

interface Props {
  columns: DatabaseColumn[];
  searchColumns: DatabaseColumn[];
  preExpFilterColumns: DatabaseColumn[];
  filters: Record<string, SearchNodePayload>;
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onChange: (filters: Record<string, SearchNodePayload>) => void;
}

export default function Filters(props: Props): JSX.Element {
  const { columns, searchColumns, preExpFilterColumns, filters, availableValues, allValues, onChange } = props;

  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isMobile, isDesktop });
  const [searchTerm, setSearchTerm] = React.useState(getSearchTermFromFilters(filters));
  const searchTermCallback = useCallback(
    (value: string) => {
      let newFilters;
      if (value === '') {
        newFilters = { ...filters };
        delete newFilters.searchTermFilter;
      } else {
        newFilters = { ...filters, ...getSearchTermFilter(searchColumns, value) };
      }
      onChange(newFilters);
    },
    [searchColumns, filters, onChange]
  );
  useDebounce(searchTerm, 250, searchTermCallback);

  const [preExpAnchorEls, setPreExpAnchorEls] = useState<{ [key: string]: null | HTMLElement }>({});
  const handlePreExpFilterClick = (event: React.MouseEvent<HTMLElement>, key: string) => {
    setPreExpAnchorEls({ ...preExpAnchorEls, [key]: event.currentTarget });
  };
  const handlePreExpFilterClose = (key: string) => {
    setPreExpAnchorEls({ ...preExpAnchorEls, [key]: null });
  };

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const filterPillItems = useMemo(() => {
    const result: PillListItem<string>[] = [];

    preExpFilterColumns.forEach((preExpFilterColumn) => {
      const key = preExpFilterColumn.key;

      if (filters[key]) {
        let notPresentFilterValue;
        if (filters[key].values[0] === null && key === 'project_name') {
          notPresentFilterValue = strings.NO_PROJECT;
        }

        result.push({
          id: key,
          label: preExpFilterColumn.name as string,
          value: notPresentFilterValue ?? filters[key].values.join(', '),
        });
      }
    });

    for (const col of columns) {
      const filter = filters[col.key];
      if (filter) {
        result.push({
          id: col.key,
          label: col.name,
          value: filter.values.join(`, `),
        } as PillListItem<string>);
      }
    }
    return result;
  }, [filters, columns, preExpFilterColumns]);

  const onChangePreExpFilter = (preExpFilterColumn: DatabaseColumn, selectedValues: (string | null)[]) => {
    let newFilters;
    if (selectedValues.length === 0) {
      newFilters = { ...filters };
      delete newFilters[preExpFilterColumn.key];
    } else {
      newFilters = { ...filters, ...getPreExpFilter(preExpFilterColumn, selectedValues) };
    }
    onChange(newFilters);
  };

  const onUpdateFilters = (newFilters: Record<string, SearchNodePayload>) => {
    const keepFilters = Object.entries(filters).filter(
      (ent) => ent[0] === 'searchTermFilter' || preExpFilterColumns.some((col) => ent[0] === col.key)
    );
    onChange({ ...Object.fromEntries(keepFilters), ...newFilters });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const onChangeSearch = (value: unknown) => {
    setSearchTerm(value as string);
  };

  const onClearSearch = () => {
    setSearchTerm('');
  };

  const renderFilterMultiSelect = (preExpFilterColumn: DatabaseColumn) => {
    const preExpFilterOptions = getOptions(preExpFilterColumn, availableValues, allValues).filter(
      (opt) => opt.value !== null
    );

    return (
      <FilterMultiSelect
        filterKey={preExpFilterColumn.key}
        initialSelection={getCurrentPreExpFilterValues(preExpFilterColumn, filters)}
        label={preExpFilterColumn.name as string}
        onCancel={() => handlePreExpFilterClose(preExpFilterColumn.key)}
        onConfirm={(selectedValues: (string | null)[]) => {
          handlePreExpFilterClose(preExpFilterColumn.key);
          onChangePreExpFilter(preExpFilterColumn, selectedValues);
        }}
        options={preExpFilterOptions.map((opt) => opt.value!)}
        renderOption={(val) => preExpFilterOptions.find((opt) => opt.value === val)?.label ?? ''}
        {...(preExpFilterColumn.key === 'project_name'
          ? {
              notPresentFilterLabel: strings.NO_PROJECT,
              notPresentFilterShown: true,
            }
          : {})}
      />
    );
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Box className={classes.filtersContainer}>
        <TextField
          placeholder={strings.SEARCH}
          iconLeft='search'
          label=''
          id='search'
          type='text'
          className={classes.searchField}
          onChange={onChangeSearch}
          value={searchTerm}
          iconRight='cancel'
          onClickRightIcon={onClearSearch}
        />
        {preExpFilterColumns.map((preExpFilterColumn, index) => {
          const valuesAvailable =
            (allValues[preExpFilterColumn.key]?.values || []).filter((value: string | null) => !!value).length > 0;

          if (!valuesAvailable) {
            return null;
          }

          const numPreExpSelected = getCurrentPreExpFilterValues(preExpFilterColumn, filters).length;

          return (
            <div key={index}>
              <div
                className={classes.preExpFilterDropdown}
                onClick={(event) => handlePreExpFilterClick(event, preExpFilterColumn.key)}
              >
                <Typography>
                  {`${preExpFilterColumn.name}${numPreExpSelected > 0 ? ' (' + numPreExpSelected + ')' : ''}`}
                </Typography>
                <Icon
                  name={Boolean(preExpAnchorEls[preExpFilterColumn.key]) ? 'chevronUp' : 'chevronDown'}
                  className={classes.preExpFilterIconRight}
                />
              </div>
              {isMobile && Boolean(preExpAnchorEls[preExpFilterColumn.key]) ? (
                <div className={classes.mobileContainer}>{renderFilterMultiSelect(preExpFilterColumn)}</div>
              ) : (
                <Popover
                  id='pre-exposed-filter-popover'
                  open={Boolean(preExpAnchorEls[preExpFilterColumn.key])}
                  onClose={() => handlePreExpFilterClose(preExpFilterColumn.key)}
                  anchorEl={preExpAnchorEls[preExpFilterColumn.key]}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  className={classes.popoverContainer}
                >
                  {renderFilterMultiSelect(preExpFilterColumn)}
                </Popover>
              )}
            </div>
          );
        })}
        <Tooltip title={strings.FILTER}>
          <Button
            id='filter'
            onClick={(event) => event && handleFilterClick(event)}
            type='passive'
            priority='ghost'
            icon='filter'
          />
        </Tooltip>
        <Popover
          id='simple-popover'
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          className={classes.popoverContainer}
        >
          <FilterGroup
            initialFilters={filters}
            fields={columns.map((col) => ({
              name: col.key,
              label: col.name as string,
              type: col.filter?.type ?? 'hidden',
            }))}
            values={allValues}
            onCancel={handleFilterClose}
            onConfirm={(fs) => {
              handleFilterClose();
              onUpdateFilters(fs);
            }}
          />
        </Popover>
      </Box>
      <PillList data={filterPillItems} onRemove={removeFilter} />
    </Container>
  );
}

function getSearchTermFilter(searchCols: DatabaseColumn[], searchTerm: string): Record<string, SearchNodePayload> {
  const orNode: SearchNodePayload = {
    children: searchCols.map((col) => ({
      operation: 'field',
      field: col.key,
      type: col.searchType ?? 'Fuzzy',
      values: [searchTerm],
    })),
    operation: 'or',
  };

  return { searchTermFilter: orNode };
}

function getPreExpFilter(col: DatabaseColumn, values: (string | null)[]): Record<string, SearchNodePayload> {
  let _values: (string | null)[] = [];
  const isNotPresentFilter = values.length === 1 && values[0] === null;
  if (isNotPresentFilter) {
    _values = [null];
  } else {
    _values = values as string[];
  }

  return {
    [col.key]: {
      operation: 'field',
      field: col.key,
      type: 'Exact',
      values: _values,
    },
  };
}

function getCurrentPreExpFilterValues(col: DatabaseColumn, filters: Record<string, SearchNodePayload>): string[] {
  return filters[col.key]?.values ?? [];
}

function getOptions(col: DatabaseColumn, availableValues: FieldValuesPayload, allValues: FieldValuesPayload): Option[] {
  return allValues[col.key].values.map((v) => {
    return {
      label: v,
      value: v,
      disabled: availableValues[col.key].values.findIndex((value) => v === value) === -1,
    };
  });
}
