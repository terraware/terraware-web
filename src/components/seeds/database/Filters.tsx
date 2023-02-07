import { ArrowDropDown } from '@mui/icons-material';
import { Chip, Container, Divider, Link, Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback } from 'react';
import { FieldNodePayload, FieldValuesPayload, OrNodePayload, SearchNodePayload } from 'src/api/search';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';
import FilterCountWeight from './filters/FilterCountWeight';
import DateRange from './filters/FilterDateRange';
import MultipleSelection from './filters/FilterMultipleSelection';
import FilterNumberRange from './filters/FilterNumberRange';
import Search from './filters/FilterSearch';
import SingleSelection from './filters/FilterSingleSelection';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { DatabaseColumn, Option } from '@terraware/web-components/components/table/types';
import TextField from 'src/components/common/Textfield/Textfield';
import useDebounce from 'src/utils/useDebounce';

interface StyleProps {
  isMobile?: boolean;
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0),
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column' : 'row'),
  },
  pill: {
    height: '32px',
    display: 'inline-block',
    marginBottom: (props: StyleProps) => (props.isDesktop ? 0 : theme.spacing(1)),
  },
  stateBox: {
    width: '264px',
    padding: theme.spacing(1.75),
  },
  stateItem: {
    display: 'flex',
    alignItems: 'center',
  },
  mainTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 3),
    backgroundColor: theme.palette.common.white,
  },
  link: {
    paddingTop: '6px',
  },
  selectedFilter: {
    border: `2px solid ${theme.palette.neutral[600]}`,
  },
  filtersContainer: {
    minHeight: '32px',
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column' : 'row'),
    flexWrap: (props: StyleProps) => (props.isMobile ? 'nowrap' : 'wrap'),
    alignItems: (props: StyleProps) => (props.isMobile ? 'flex-start' : 'center'),
    gap: theme.spacing(1.5),
    marginTop: `-${theme.spacing(1)}`,
  },
  searchField: {
    width: '300px',
    marginTop: theme.spacing(-0.5),
  },
}));

interface Props {
  columns: DatabaseColumn[];
  searchColumns: DatabaseColumn[];
  filters: Record<string, SearchNodePayload>;
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onChange: (filters: Record<string, SearchNodePayload>) => void;
}

export default function Filters(props: Props): JSX.Element {
  const { columns, searchColumns, filters, availableValues, allValues, onChange } = props;
  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isMobile, isDesktop });
  const [popover, setPopover] = React.useState<FilterPopover>();
  const [searchTerm, setSearchTerm] = React.useState('');
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
  const debouncedSearchTerm = useDebounce(searchTerm, 250, searchTermCallback);

  const onChangeFilters = (col: DatabaseColumn, filter: SearchNodePayload) => {
    const updatedFilters = getUpdatedFilters(col, filter, filters);
    const updatedSearchFilters =
      debouncedSearchTerm === '' ? {} : getSearchTermFilter(searchColumns, debouncedSearchTerm);
    onChange({ ...updatedFilters, ...updatedSearchFilters });
    setPopover(undefined);
  };

  const clearAllFilters = () => {
    const updatedFilters: Record<string, SearchNodePayload> = {};
    onChange(updatedFilters);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, col: DatabaseColumn) => {
    setPopover({ anchor: event.currentTarget, col });
  };

  const onClosePopover = () => {
    setPopover(undefined);
  };

  const getLabel = (col: DatabaseColumn): string | JSX.Element => {
    const filter = filters[col.key];
    let totalFilteredValues = filter?.values?.length ?? 0;
    const isBoolean = col.type === 'boolean';
    if (filter && totalFilteredValues && isBoolean) {
      const indexNull = filter.values?.findIndex((value: any) => value === null) ?? -1;
      if (indexNull > -1) {
        totalFilteredValues = totalFilteredValues - 1;
      }
    }
    if (filter?.operation === 'or') {
      totalFilteredValues = filter.children.length;
    }

    if (typeof col.name === 'string') {
      return totalFilteredValues ? `${col.name} (${totalFilteredValues})` : col.name;
    } else {
      return col.name;
    }
  };

  const onChangeSearch = (value: unknown) => {
    setSearchTerm(value as string);
  };

  const onClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <div className={classes.filtersContainer}>
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
        <SimplePopover
          popover={popover}
          columns={columns}
          filters={filters}
          availableValues={availableValues}
          allValues={allValues}
          onFilterChange={onChangeFilters}
          onClose={onClosePopover}
        />
        {columns.map((col) => {
          return (
            <div key={col.key} className={classes.pill}>
              <Chip
                id={`filter-${col.key}`}
                variant='outlined'
                size='medium'
                label={getLabel(col)}
                onClick={(event) => handleClick(event, col)}
                icon={<ArrowDropDown />}
                className={filters[col.key] ? classes.selectedFilter : ''}
              />
            </div>
          );
        })}
      </div>
      <div className={classes.link}>
        <Link
          id='clearAll'
          href='#'
          onClick={(event: React.SyntheticEvent) => {
            preventDefaultEvent(event);
            clearAllFilters();
          }}
          underline='hover'
        >
          {strings.CLEAR_FILTERS}
        </Link>
      </div>
    </Container>
  );
}

export function getUpdatedFilters(
  col: DatabaseColumn,
  filter: SearchNodePayload,
  filters: Record<string, SearchNodePayload>
): Record<string, SearchNodePayload> {
  const updatedFilters = { ...filters };
  const originalFilter = updatedFilters[col.key];

  if (!originalFilter) {
    if (filter.operation === 'field') {
      if ((filter.values?.length ?? 0) > 0) {
        updatedFilters[col.key] = filter;
      }
    } else if (filter.operation === 'or') {
      if (filter.children.length > 0) {
        updatedFilters[col.key] = filter;
      }
    }
  } else {
    if (filter.operation === 'field') {
      if ((filter.values?.length ?? 0) > 0) {
        updatedFilters[col.key] = filter;
      } else {
        delete updatedFilters[col.key];
      }
    } else if (filter.operation === 'or') {
      if (filter.children.length > 0) {
        updatedFilters[col.key] = filter;
      } else {
        delete updatedFilters[col.key];
      }
    }
  }

  return updatedFilters;
}

function getSearchTermFilter(searchCols: DatabaseColumn[], searchTerm: string): Record<string, SearchNodePayload> {
  const orNode: SearchNodePayload = {
    children: searchCols.map((col) => ({
      operation: 'field',
      field: col.key,
      type: 'Fuzzy',
      values: [searchTerm],
    })),
    operation: 'or',
  };

  return { searchTermFilter: orNode };
}

function getOptions(col: DatabaseColumn, availableValues: FieldValuesPayload, allValues: FieldValuesPayload): Option[] {
  const map1 = allValues[col.key].values.map((v) => {
    return {
      label: v,
      value: v,
      disabled: availableValues[col.key].values.findIndex((value) => v === value) === -1,
    };
  });

  return map1;
}

type FilterPopover = { col: DatabaseColumn; anchor: HTMLDivElement | null };

interface ChipPopoverProps {
  popover?: FilterPopover;
  columns: DatabaseColumn[];
  filters: Record<string, SearchNodePayload>;
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onFilterChange: (col: DatabaseColumn, filter: SearchNodePayload) => void;
  onClose: () => void;
}

export function SimplePopover({
  popover,
  availableValues,
  allValues,
  filters,
  onFilterChange: filterChange,
  onClose,
}: ChipPopoverProps): JSX.Element {
  const classes = useStyles({});

  const clearFilter = () => {
    if (popover) {
      if (popover.col.filter?.type === 'count_weight') {
        const newFilter: OrNodePayload = {
          field: popover.col.key,
          values: [],
          type: 'Exact',
          operation: 'or',
          children: [],
        };

        onFilterChange(newFilter);
      } else {
        const newFilter: FieldNodePayload = {
          field: popover.col.key,
          values: [],
          type: 'Exact',
          operation: 'field',
        };

        onFilterChange(newFilter);
      }
    }
  };

  const onFilterChange = (filter: SearchNodePayload) => {
    if (popover?.col) {
      filterChange(popover?.col, filter);
    }
  };

  return (
    <Popover
      id='filter-popover'
      open={Boolean(popover?.anchor)}
      anchorEl={popover?.anchor}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <div className={classes.mainTitle}>
        <Typography variant='caption'>{popover?.col.name}</Typography>
        {popover && filters[popover?.col.key]?.values ? (
          <Link
            id='clear'
            href='#'
            onClick={(event: React.SyntheticEvent) => {
              preventDefaultEvent(event);
              clearFilter();
            }}
          >
            {strings.CLEAR}
          </Link>
        ) : null}
      </div>
      <Divider />
      {popover?.col.filter?.type === 'multiple_selection' && (
        <MultipleSelection
          field={popover?.col.key}
          values={filters[popover?.col.key]?.values ?? []}
          onChange={onFilterChange}
          options={getOptions(popover?.col, availableValues, allValues)}
        />
      )}
      {popover?.col.filter?.type === 'single_selection' && (
        <SingleSelection
          field={popover?.col.key}
          values={filters[popover?.col.key]?.values ?? []}
          onChange={onFilterChange}
          options={getOptions(popover?.col, availableValues, allValues)}
          isBoolean={Boolean(popover?.col.type === 'boolean')}
        />
      )}
      {popover?.col.filter?.type === 'search' && (
        <Search
          field={popover?.col.key}
          autoFocus={true}
          onChange={onFilterChange}
          values={filters[popover?.col.key]?.values ?? []}
        />
      )}
      {popover?.col.filter?.type === 'date_range' && (
        <DateRange
          field={popover?.col.key}
          onChange={onFilterChange}
          values={filters[popover?.col.key]?.values ?? []}
        />
      )}
      {popover?.col.filter?.type === 'number_range' && (
        <FilterNumberRange
          field={popover?.col.key}
          onChange={onFilterChange}
          values={filters[popover?.col.key]?.values ?? []}
        />
      )}
      {popover?.col.filter?.type === 'count_weight' && (
        <FilterCountWeight
          field={popover?.col.key}
          onChange={onFilterChange}
          payloads={filters[popover?.col.key]?.children ?? []}
        />
      )}
    </Popover>
  );
}
