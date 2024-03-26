import React from 'react';

import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { isValid } from 'date-fns';

import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import { FieldNodePayload } from 'src/types/Search';
import { getIsoDateUtc } from 'src/utils/dateFormatter';

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

export default function DateRange(props: Props): JSX.Element {
  const classes = useStyles();
  const [startDate, setStartDate] = React.useState(props.values[0]);
  const [endDate, setEndDate] = React.useState(props.values[1]);

  React.useEffect(() => {
    setStartDate(props.values[0] || null);
    setEndDate(props.values[1] || null);
  }, [props.values]);

  const onChangeDate = (id: string, value?: string | null) => {
    const newValues = [startDate, endDate];
    const date = value && isValid(value) ? getIsoDateUtc(new Date(value)) : null;
    if (id === 'startDate' && date) {
      setStartDate(date);
      newValues[0] = date;
    }
    if (id === 'endDate' && date) {
      setEndDate(date);
      newValues[1] = date;
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
          <DatePicker
            id='startDate'
            value={startDate}
            onChange={(value) => onChangeDate('startDate', value)}
            label={strings.START}
            aria-label='Start date'
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            id='endDate'
            value={endDate}
            onChange={(value) => onChangeDate('endDate', value)}
            label={strings.END}
            aria-label='End date'
          />
        </Grid>
      </Grid>
    </div>
  );
}
