import { ArrowForward } from '@mui/icons-material';
import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { format, isValid } from 'date-fns';
import React from 'react';
import { FieldNodePayload } from 'src/api/search';
import DatePicker from 'src/components/common/DatePicker';
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
  values: (string | null)[];
}

export default function DateRange(props: Props): JSX.Element {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState(props.values[0]);
  const [endDate, setEndDate] = React.useState(props.values[1]);

  React.useEffect(() => {
    setStartDate(props.values[0] || null);
    setEndDate(props.values[1] || null);
  }, [props.values]);

  const onChangeDate = (id: string, value?: string | null) => {
    const newValues = props.values.length ? [...props.values] : [startDate, endDate];
    if (id === 'startDate' && value) {
      setStartDate(value);
      newValues[0] = value;
    }
    if (id === 'endDate' && value) {
      setEndDate(value);
      newValues[1] = value;
    }
  };

  const onEnter = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      if (startDate || endDate) {
        const formattedStartDate =
          startDate && isValid(startDate) ? format(startDate as unknown as Date, 'yyyy-MM-dd') : null;
        const formattedEndDate = endDate && isValid(endDate) ? format(endDate as unknown as Date, 'yyyy-MM-dd') : null;
        const newValues = [formattedStartDate, formattedEndDate];

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
          <DatePicker
            id='startDate'
            value={startDate}
            onChange={onChangeDate}
            label={strings.START}
            aria-label='Start date'
            onKeyPress={(e) => onEnter(e)}
          />
        </Grid>
        <Grid item xs={1} className={classes.flexContainer}>
          <ArrowForward />
        </Grid>
        <Grid item xs={5}>
          <DatePicker
            id='endDate'
            value={endDate}
            onChange={onChangeDate}
            label={strings.END}
            aria-label='End date'
            onKeyPress={(e) => onEnter(e)}
          />
        </Grid>
      </Grid>
    </div>
  );
}
