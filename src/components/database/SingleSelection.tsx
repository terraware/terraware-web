import { List, ListItem, ListItemText } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { SearchField, SearchFilter } from '../../api/types/search';
import { Option } from './columns';

const useStyles = makeStyles((theme) =>
  createStyles({
    box: {
      width: '264px',
      padding: theme.spacing(1.75),
    },
    item: {
      display: 'flex',
      alignItems: 'center',
    },
  })
);

interface Props {
  field: SearchField;
  onChange: (filter: SearchFilter) => void;
  options: Option[];
  values: (string | null)[];
  isBoolean: boolean;
}

export default function SingleSelection(props: Props): JSX.Element {
  const classes = useStyles();

  const options = [...props.options];
  if (props.isBoolean) {
    if (
      options.find((o) => o.value === null) &&
      !options.find((o) => o.value === 'false')
    ) {
      options.push({ label: 'false', value: 'false' });
    }
  }
  options.sort((a, b) =>
    a.value && b.value ? a.value.localeCompare(b.value) : 0
  );

  const handleChange = (value: string | null) => {
    let updatesValues = [value];
    if (props.isBoolean) {
      if (value === 'false') {
        updatesValues = [null, 'false'];
      }
    }

    const newFilter: SearchFilter = {
      field: props.field,
      values: updatesValues,
      type: 'Exact',
    };

    props.onChange(newFilter);
  };

  return (
    <div id={'search' + props.field} className={classes.box}>
      <List>
        {options.map(({ label, value }) => (
          <ListItem
            button
            key={label}
            onClick={() => handleChange(value)}
            selected={props.values.includes(value)}
          >
            <ListItemText primary={formatLabel(label)} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

function formatLabel(label: string | null): string | null {
  if (label === 'true') return 'Yes';
  if (label === 'false') return 'No';
  return label;
}
