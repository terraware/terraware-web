import { Chip, Container, Popover } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import React from 'react';
import { SearchField, SearchFilter } from '../../api/types/search';
import { DatabaseColumn } from './columns';
import MultipleSelection from './MultipleSelection';

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
  })
);

interface Props {
  columns: DatabaseColumn[];
  filters: SearchFilter[];
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

  return (
    <Container maxWidth='lg' className={classes.mainContainer}>
      {props.columns.map(
        (col) =>
          col.filter?.type === 'multiple_selection' && (
            <div key={col.key} className={classes.pill}>
              <SimplePopover label={col.name}>
                <MultipleSelection
                  field={col.key as SearchField}
                  values={
                    props.filters.find((f) => f.field === col.key)?.values ?? []
                  }
                  onChange={onChange}
                  options={col.filter.options}
                />
              </SimplePopover>
            </div>
          )
      )}
    </Container>
  );
}

interface ChipPopoverProps {
  label: string;
  children: React.ReactNode;
}

export function SimplePopover({
  label,
  children,
}: ChipPopoverProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        {children}
      </Popover>
    </div>
  );
}
