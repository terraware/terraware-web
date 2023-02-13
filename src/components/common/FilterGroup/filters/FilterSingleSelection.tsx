import { List, ListItem, ListItemText, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { FieldNodePayload } from 'src/api/search';
import strings from 'src/strings';
import { Option } from '@terraware/web-components/components/table/types';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    width: '264px',
    padding: theme.spacing(1.75),
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  options: Option[];
  values: (string | null)[];
  isBoolean: boolean;
}

export default function SingleSelection(props: Props): JSX.Element {
  const classes = useStyles();

  const options = [...props.options];
  const indexEnabledNull = options.findIndex((o) => o.value === null && o.disabled === false);
  if (indexEnabledNull >= 0) {
    if (props.isBoolean) {
      const falseOption = options.find((o) => o.value === 'false' && o.disabled);
      if (falseOption) {
        falseOption.disabled = false;
      }
    } else {
      if (options.find((o) => o.value === null)) {
        options.push({ label: strings.UNSPECIFIED, value: null, disabled: false });
      }
    }
    options.splice(indexEnabledNull, 1);
  } else {
    const indexDisabledNull = options.findIndex((o) => o.value === null && o.disabled);
    if (indexDisabledNull >= 0) {
      options.splice(indexDisabledNull, 1);
    }
  }
  options.sort((a, b) => (a.value && b.value ? a.value.localeCompare(b.value) : 0));

  const handleChange = (value: string | null) => {
    let updatesValues = [value];
    if (props.isBoolean) {
      if (value === 'false') {
        updatesValues = [null, 'false'];
      }
    }

    const newFilter: FieldNodePayload = {
      field: props.field,
      values: updatesValues,
      type: 'Exact',
      operation: 'field',
    };

    props.onChange(newFilter);
  };

  return (
    <div id={`filter-list-${props.field}`} className={classes.box}>
      <List>
        {options.map(({ label, value, disabled }) => (
          <ListItem
            button
            key={label}
            onClick={() => handleChange(value)}
            selected={props.values.includes(value)}
            disabled={disabled}
          >
            <ListItemText id={value ?? ''} primary={formatLabel(label)} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

function formatLabel(label: string | null): string | undefined | null {
  if (label === 'true') {
    return strings.YES;
  }
  if (label === 'false') {
    return strings.NO;
  }

  return label;
}
