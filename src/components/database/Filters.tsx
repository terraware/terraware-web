import {
  Chip,
  Container,
  Divider,
  Link,
  Popover,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import React from 'react';
import {
  FieldNodePayload,
  FieldValuesPayload,
  OrNodePayload,
  SearchNodePayload,
} from '../../api/types/search';
import strings from '../../strings';
import preventDefaultEvent from '../../utils/preventDefaultEvent';
import { DatabaseColumn, Option } from './columns';
import FilterCountWeight from './filters/FilterCountWeight';
import DateRange from './filters/FilterDateRange';
import MultipleSelection from './filters/FilterMultipleSelection';
import FilterNumberRange from './filters/FilterNumberRange';
import Search from './filters/FilterSearch';
import SingleSelection from './filters/FilterSingleSelection';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      margin: theme.spacing(2, 0, 3, 0),
      padding: theme.spacing(0),
      display: 'flex',
    },
    pill: {
      margin: theme.spacing(0, 1.5, 0, 0),
      height: '48px',
      display: 'inline-block',
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
      flex: 2,
      paddingTop: theme.spacing(1),
    },
    selectedFilter: {
      border: `2px solid ${theme.palette.neutral[600]}`,
    },
    filtersContainer: {
      minHeight: '48px',
      flex: '8 0 600px',
    },
  })
);

interface Props {
  columns: DatabaseColumn[];
  filters: SearchNodePayload[];
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onChange: (filters: SearchNodePayload[]) => void;
}

export default function Filters(props: Props): JSX.Element {
  const classes = useStyles();
  const [popover, setPopover] = React.useState<FilterPopover>();

  const onChange = (filter: SearchNodePayload) => {
    const updatedFilters = getUpdatedFilters(filter, props.filters);
    props.onChange(updatedFilters);
    setPopover(undefined);
  };

  const clearAllFilters = () => {
    const updatedFilters: SearchNodePayload[] = [];
    props.onChange(updatedFilters);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    col: DatabaseColumn
  ) => {
    setPopover({ anchor: event.currentTarget, col });
  };

  const onClosePopover = () => {
    setPopover(undefined);
  };

  const getLabel = (col: DatabaseColumn): string => {
    const filter = getFilter(col);
    let totalFilteredValues = filter?.values?.length ?? 0;
    const isBoolean = col.type === 'boolean';
    if (filter && totalFilteredValues && isBoolean) {
      const indexNull =
        filter.values?.findIndex((value: any) => value === null) ?? -1;
      if (indexNull > -1) {
        totalFilteredValues = totalFilteredValues - 1;
      }
    }
    if (filter?.operation === 'or') {
      totalFilteredValues = filter.children.length;
    }
    return totalFilteredValues
      ? `${col.name} (${totalFilteredValues})`
      : col.name;
  };

  const getFilter = (col: DatabaseColumn): SearchNodePayload | undefined => {
    const filter = props.filters.find(
      (f) =>
        (f.operation === 'field' &&
          f.field === col.key &&
          (f.values?.length ?? 0) > 0) ||
        (f.operation === 'or' && col.operation === 'or')
    );

    return filter;
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <div className={classes.filtersContainer}>
        <SimplePopover
          popover={popover}
          columns={props.columns}
          filters={props.filters}
          availableValues={props.availableValues}
          allValues={props.allValues}
          onFilterChange={onChange}
          onClose={onClosePopover}
        />
        {props.columns.map((col) => {
          return (
            <div key={col.key} className={classes.pill}>
              <Chip
                id={`filter-${col.key}`}
                variant='outlined'
                size='medium'
                label={getLabel(col)}
                onClick={(event) => handleClick(event, col)}
                icon={<ArrowDropDown />}
                className={getFilter(col) ? classes.selectedFilter : ''}
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
        >
          {strings.CLEAR_FILTERS}
        </Link>
      </div>
    </Container>
  );
}

export function getUpdatedFilters(
  filter: SearchNodePayload,
  filters: SearchNodePayload[]
): SearchNodePayload[] {
  const updatedFilters = [...filters];
  const filterIndex = updatedFilters.findIndex(
    (f) =>
      (f.operation === 'field' && f.field === filter.field) ||
      (f.operation === 'or' && filter.operation === 'or')
  );
  if (filterIndex < 0) {
    if (filter.operation === 'field') {
      if ((filter.values?.length ?? 0) > 0) {
        updatedFilters.push(filter);
      }
    } else if (filter.operation === 'or') {
      updatedFilters.push(filter);
    }
  } else {
    if (filter.operation === 'field') {
      if ((filter.values?.length ?? 0) > 0) {
        updatedFilters.splice(filterIndex, 1, filter);
      } else {
        updatedFilters.splice(filterIndex, 1);
      }
    } else if (filter.operation === 'or') {
      if (filter.children.length > 0) {
        updatedFilters.splice(filterIndex, 1, filter);
      } else {
        updatedFilters.splice(filterIndex, 1);
      }
    }
  }
  return updatedFilters;
}

function getOptions(
  col: DatabaseColumn,
  availableValues: FieldValuesPayload,
  allValues: FieldValuesPayload
): Option[] {
  const map1 = allValues[col.key].values.map((v) => {
    return {
      label: v,
      value: v,
      disabled:
        availableValues[col.key].values.findIndex((value) => v === value) ===
        -1,
    };
  });
  return map1;
}

type FilterPopover = { col: DatabaseColumn; anchor: HTMLDivElement | null };

interface ChipPopoverProps {
  popover?: FilterPopover;
  columns: DatabaseColumn[];
  filters: SearchNodePayload[];
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onFilterChange: (filter: SearchNodePayload) => void;
  onClose: () => void;
}

export function SimplePopover({
  popover,
  availableValues,
  allValues,
  filters,
  onFilterChange,
  onClose,
}: ChipPopoverProps): JSX.Element {
  const classes = useStyles();

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
      </div>
      <Divider />
      {popover?.col.filter?.type === 'multiple_selection' && (
        <MultipleSelection
          field={popover?.col.key}
          values={
            filters.find((f) => f.field === popover?.col.key)?.values ?? []
          }
          onChange={onFilterChange}
          options={getOptions(popover?.col, availableValues, allValues)}
        />
      )}
      {popover?.col.filter?.type === 'single_selection' && (
        <SingleSelection
          field={popover?.col.key}
          values={
            filters.find((f) => f.field === popover?.col.key)?.values ?? []
          }
          onChange={onFilterChange}
          options={getOptions(popover?.col, availableValues, allValues)}
          isBoolean={Boolean(popover?.col.type === 'boolean')}
        />
      )}
      {popover?.col.filter?.type === 'search' && (
        <Search
          field={popover?.col.key}
          onChange={onFilterChange}
          values={
            filters.find((f) => f.field === popover?.col.key)?.values ?? []
          }
        />
      )}
      {popover?.col.filter?.type === 'date_range' && (
        <DateRange
          field={popover?.col.key}
          onChange={onFilterChange}
          values={
            filters.find((f) => f.field === popover?.col.key)?.values ?? []
          }
        />
      )}
      {popover?.col.filter?.type === 'number_range' && (
        <FilterNumberRange
          field={popover?.col.key}
          onChange={onFilterChange}
          values={
            filters.find((f) => f.field === popover?.col.key)?.values ?? []
          }
        />
      )}
      {popover?.col.filter?.type === 'count_weight' && (
        <FilterCountWeight
          field={popover?.col.key}
          onChange={onFilterChange}
          payloads={filters.find((f) => f.operation === 'or')?.children ?? []}
        />
      )}
    </Popover>
  );
}
