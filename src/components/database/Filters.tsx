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
import { FieldValuesPayload, SearchFilter } from '../../api/types/search';
import preventDefaultEvent from '../../utils/preventDefaultEvent';
import { DatabaseColumn, Option } from './columns';
import DateRange from './filters/FilterDateRange';
import MultipleSelection from './filters/FilterMultipleSelection';
import NumberRange from './filters/FilterNumberRange';
import Search from './filters/FilterSearch';
import SingleSelection from './filters/FilterSingleSelection';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      margin: theme.spacing(2, 0, 3, 0),
      padding: theme.spacing(0),
      display: 'flex',
      flexWrap: 'wrap',
    },
    pill: {
      margin: theme.spacing(0, 1.5, 0, 0),
      height: '48px',
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
      display: 'flex',
      marginLeft: 'auto',
      paddingTop: theme.spacing(1),
    },
    selectedFilter: {
      border: `2px solid ${theme.palette.neutral[600]}`,
    },
  })
);

interface Props {
  columns: DatabaseColumn[];
  filters: SearchFilter[];
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onChange: (filters: SearchFilter[]) => void;
}

export default function Filters(props: Props): JSX.Element {
  const classes = useStyles();
  const [popover, setPopover] = React.useState<FilterPopover>();

  const onChange = (filter: SearchFilter) => {
    const field = filter.field;
    const updatedFilters = [...props.filters];
    const filterIndex = updatedFilters.findIndex((f) => f.field === field);
    if (filterIndex < 0) {
      if (filter.values.length > 0) {
        updatedFilters.push(filter);
      }
    } else {
      if (filter.values.length > 0) {
        updatedFilters.splice(filterIndex, 1, filter);
      } else {
        updatedFilters.splice(filterIndex, 1);
      }
    }
    props.onChange(updatedFilters);
    setPopover(undefined);
  };

  const clearAllFilters = () => {
    const updatedFilters: SearchFilter[] = [];
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
    const filter = props.filters.find((filter) => filter.field === col.key);
    let totalFilteredValues = filter?.values.length;
    const isBoolean = col.type === 'boolean';
    if (filter && totalFilteredValues && isBoolean) {
      const indexNull = filter.values.findIndex((value) => value === null);
      if (indexNull > -1) {
        totalFilteredValues = totalFilteredValues - 1;
      }
    }
    return totalFilteredValues
      ? `${col.name} (${totalFilteredValues})`
      : col.name;
  };

  const isFilterSelected = (colKey: string): boolean => {
    const filter = props.filters.find((filter) => filter.field === colKey);
    return filter ? filter.values.length > 0 : false;
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
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
              className={
                isFilterSelected(col.key) ? classes.selectedFilter : ''
              }
            />
          </div>
        );
      })}
      <div className={classes.link}>
        <Link
          id='clearAll'
          href='#'
          onClick={(event: React.SyntheticEvent) => {
            preventDefaultEvent(event);
            clearAllFilters();
          }}
        >
          Clear Filters
        </Link>
      </div>
    </Container>
  );
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
  filters: SearchFilter[];
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onFilterChange: (filter: SearchFilter) => void;
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
      const newFilter: SearchFilter = {
        field: popover.col.key,
        values: [],
        type: 'Exact',
      };

      onFilterChange(newFilter);
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
          Clear
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
        <NumberRange
          field={popover?.col.key}
          onChange={onFilterChange}
          values={
            filters.find((f) => f.field === popover?.col.key)?.values ?? []
          }
        />
      )}
    </Popover>
  );
}
