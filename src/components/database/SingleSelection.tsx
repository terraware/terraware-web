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
  values: string[];
}

export default function SingleSelection(props: Props): JSX.Element {
  const classes = useStyles();

  const handleChange = (value: string) => {
    const updatesValues = [value];

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
        {props.options.map(({ label, value }) => (
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

function formatLabel(label: string): string {
  if (label === null) return '-Empty-';
  return label;
}
