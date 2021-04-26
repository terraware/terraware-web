import { createStyles, Grid, makeStyles } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import { SearchField, SearchFilter } from '../../../api/types/search';
import strings from '../../../strings';
import DatePicker from '../../common/DatePicker';

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
  field: SearchField;
  onChange: (filter: SearchFilter) => void;
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

  const onChangeDate = (id: string, value?: string) => {
    const formatedValue = value ? value.substr(0, 10) : null;
    const newValues = props.values.length
      ? [...props.values]
      : [startDate, endDate];
    if (id === 'startDate' && value) {
      setStartDate(formatedValue);
      newValues[0] = formatedValue;
    }
    if (id === 'endDate' && value) {
      setEndDate(formatedValue);
      newValues[1] = formatedValue;
    }
  };

  const onEnter = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      if (startDate || endDate) {
        const newValues = [startDate, endDate];

        const newFilter: SearchFilter = {
          field: props.field,
          values: newValues,
          type: 'Range',
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
          <ArrowForwardIcon />
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
