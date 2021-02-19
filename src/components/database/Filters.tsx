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
  FieldValuesPayload,
  SearchField,
  SearchFilter,
} from '../../api/types/search';
import preventDefaultEvent from '../../utils/preventDefaultEvent';
import { DatabaseColumn, Option } from './columns';
import DateRange from './DateRange';
import MultipleSelection from './MultipleSelection';
import NumberRange from './NumberRange';
import Search from './Search';
import SingleSelection from './SingleSelection';

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
  })
);

interface Props {
  columns: DatabaseColumn[];
  filters: SearchFilter[];
  availableValues: FieldValuesPayload;
  onChange: (filters: SearchFilter[]) => void;
}

export default function Filters(props: Props): JSX.Element {
  const classes = useStyles();

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
  };

  const clearAllFilters = () => {
    const updatedFilters: SearchFilter[] = [];
    props.onChange(updatedFilters);
  };

  return (
    <Container maxWidth='lg' className={classes.mainContainer}>
      {props.columns.map((col) => {
        return (
          <div key={col.key} className={classes.pill}>
            <SimplePopover label={col.name} onClear={onChange} field={col.key}>
              {col.filter?.type === 'multiple_selection' && (
                <MultipleSelection
                  field={col.key}
                  values={
                    props.filters.find((f) => f.field === col.key)?.values ?? []
                  }
                  onChange={onChange}
                  options={getOptions(col, props.availableValues)}
                />
              )}
              {col.filter?.type === 'single_selection' && (
                <SingleSelection
                  field={col.key}
                  values={
                    props.filters.find((f) => f.field === col.key)?.values ?? []
                  }
                  onChange={onChange}
                  options={getOptions(col, props.availableValues)}
                />
              )}
              {col.filter?.type === 'search' && (
                <Search
                  field={col.key}
                  onChange={onChange}
                  values={
                    props.filters.find((f) => f.field === col.key)?.values ?? []
                  }
                />
              )}
              {col.filter?.type === 'date_range' && (
                <DateRange
                  field={col.key}
                  onChange={onChange}
                  values={
                    props.filters.find((f) => f.field === col.key)?.values ?? []
                  }
                />
              )}
              {col.filter?.type === 'number_range' && (
                <NumberRange
                  field={col.key}
                  onChange={onChange}
                  values={
                    props.filters.find((f) => f.field === col.key)?.values ?? []
                  }
                />
              )}
            </SimplePopover>
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
          Clear filters
        </Link>
      </div>
    </Container>
  );
}

function getOptions(
  col: DatabaseColumn,
  availableValues: FieldValuesPayload
): Option[] {
  return availableValues[col.key].values.map((v) => ({
    label: v,
    value: v,
  }));
}

interface ChipPopoverProps {
  label: string;
  children: React.ReactNode;
  onClear: (filter: SearchFilter) => void;
  field: SearchField;
}

export function SimplePopover({
  label,
  children,
  onClear,
  field,
}: ChipPopoverProps): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const clearFilter = () => {
    const newFilter: SearchFilter = {
      field: field,
      values: [],
      type: 'Exact',
    };

    onClear(newFilter);
  };

  return (
    <div>
      <Chip
        variant='outlined'
        size='medium'
        label={label}
        onClick={handleClick}
        icon={<ArrowDropDown />}
      />
      <Popover
        id='filter-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
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
          <Typography variant='caption'>{label}</Typography>
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
        {children}
      </Popover>
    </div>
  );
}
