import { createStyles, Grid, makeStyles } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import { SearchField, SearchFilter } from '../../api/types/search';
import TextField from '../common/TextField';

interface Props {
  field: SearchField;
  onChange: (filter: SearchFilter) => void;
  values: string[];
}

const useStyles = makeStyles((theme) =>
  createStyles({
    box: {
      padding: theme.spacing(1.75),
    },
    flexContainer: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
    },
  })
);

export default function NumberRange(props: Props): JSX.Element {
  const classes = useStyles();
  const onChange = (id: string, value?: unknown) => {
    const newValues = props.values.length
      ? [...props.values]
      : [minValue, maxValue];

    if (id === 'minValue') {
      setMinValue(value as string);
      newValues[0] = (value as string) || '0';
    }
    if (id === 'maxValue') {
      setMaxValue(value as string);
      newValues[1] = (value as string) || '0';
    }
  };

  const onEnter = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const newValues = [minValue, maxValue];

      const newFilter: SearchFilter = {
        field: props.field,
        values: newValues,
        type: 'Range',
      };

      props.onChange(newFilter);
    }
  };

  const [minValue, setMinValue] = React.useState(props.values[0] || '0');
  const [maxValue, setMaxValue] = React.useState(props.values[1] || '0');

  return (
    <div id={'search' + props.field} className={classes.box}>
      <Grid container spacing={4}>
        <Grid item xs={5}>
          <TextField
            id='minValue'
            value={minValue}
            onChange={onChange}
            label='Min'
            onKeyPress={(e) => onEnter(e)}
          />
        </Grid>
        <Grid item xs={1} className={classes.flexContainer}>
          <ArrowForwardIcon />
        </Grid>
        <Grid item xs={5}>
          <TextField
            id='maxValue'
            value={maxValue}
            onChange={onChange}
            label='Max'
            onKeyPress={(e) => onEnter(e)}
          />
        </Grid>
      </Grid>
    </div>
  );
}
