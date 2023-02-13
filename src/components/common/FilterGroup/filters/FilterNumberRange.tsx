import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import TextField from '../../../common/TextField';
import { FieldNodePayload } from '../../../../api/search';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    padding: theme.spacing(1.75),
  },
  flexContainer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  onDelete: () => void;
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
    const newValues = [minValue, maxValue];

    if (id === 'minValue') {
      setMinValue(value as string);
      newValues[0] = (value as string) || null;
    }
    if (id === 'maxValue') {
      setMaxValue(value as string);
      newValues[1] = (value as string) || null;
    }

    if (newValues[0] || newValues[1]) {
      const newFilter: FieldNodePayload = {
        field: props.field,
        values: newValues,
        type: 'Range',
        operation: 'field',
      };

      props.onChange(newFilter);
    } else {
      props.onDelete();
    }
  };

  return (
    <div className={classes.box}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField id='minValue' value={minValue} onChange={onChange} label={strings.MIN} />
        </Grid>
        <Grid item xs={6}>
          <TextField id='maxValue' value={maxValue} onChange={onChange} label={strings.MAX} />
        </Grid>
      </Grid>
    </div>
  );
}
