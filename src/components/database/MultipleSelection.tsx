import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { SearchField, SearchFilter } from '../../api/types/search';
import Checkbox from '../common/Checkbox';
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

export default function MultipleSelection(props: Props): JSX.Element {
  const classes = useStyles();

  const handleChange = (value: string) => {
    const updatesValues = [...props.values];

    const valueIndex = updatesValues.findIndex((v) => v === value);
    if (valueIndex < 0) {
      updatesValues.push(value);
    } else {
      updatesValues.splice(valueIndex, 1);
    }

    const newFilter: SearchFilter = {
      field: props.field,
      values: updatesValues,
      type: 'Exact',
    };

    props.onChange(newFilter);
  };

  return (
    <div className={classes.box}>
      {props.options.map(({ label, value }) => (
        <div key={value} className={classes.item}>
          <Checkbox
            id={value}
            name={value}
            label={label}
            value={props.values.includes(value)}
            onChange={() => handleChange(value)}
          />
        </div>
      ))}
    </div>
  );
}
