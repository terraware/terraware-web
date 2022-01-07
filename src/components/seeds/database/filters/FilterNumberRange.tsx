import { createStyles, Grid, makeStyles } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import TextField from '../../../common/TextField';
import { FieldNodePayload } from '../../../../api/seeds/search';

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

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  values: (string | null)[];
}

export default function NumberRange(props: Props): JSX.Element {
  const classes = useStyles();
  const [minValue, setMinValue] = React.useState(props.values[0] || null);
  const [maxValue, setMaxValue] = React.useState(props.values[1] || null);

  React.useEffect(() => {
    setMinValue(props.values[0] || null);
    setMaxValue(props.values[1] || null);
  }, [props.values]);

  const onChange = (id: string, value?: unknown) => {
    const newValues = props.values.length ? [...props.values] : [minValue, maxValue];

    if (id === 'minValue') {
      setMinValue(value as string);
      newValues[0] = (value as string) || null;
    }
    if (id === 'maxValue') {
      setMaxValue(value as string);
      newValues[1] = (value as string) || null;
    }
  };

  const onEnter = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      if (minValue || maxValue) {
        const newValues = [minValue, maxValue];

        const newFilter: FieldNodePayload = {
          field: props.field,
          values: newValues,
          type: 'Range',
          operation: 'field',
        };

        props.onChange(newFilter);
      }
    }
  };

  return (
    <div className={classes.box}>
      <Grid container spacing={4}>
        <Grid item xs={5}>
          <TextField id='minValue' value={minValue} onChange={onChange} label='Min' onKeyPress={(e) => onEnter(e)} />
        </Grid>
        <Grid item xs={1} className={classes.flexContainer}>
          <ArrowForwardIcon />
        </Grid>
        <Grid item xs={5}>
          <TextField id='maxValue' value={maxValue} onChange={onChange} label='Max' onKeyPress={(e) => onEnter(e)} />
        </Grid>
      </Grid>
    </div>
  );
}
