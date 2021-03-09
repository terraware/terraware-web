import { Grid } from '@material-ui/core';
import dayjs from 'dayjs';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import timeSelector from '../../state/selectors/time';
import DatePicker from '../common/DatePicker';

interface Props {
  onChange: (id: string, value: string) => void;
  refreshErrors: (newErrors: FieldError[]) => void;
  collectedDate?: string;
  receivedDate?: string;
}

type FieldError = {
  id: string;
  msg: string;
};
export function AccessionDates({
  onChange,
  refreshErrors,
  collectedDate,
  receivedDate,
}: Props): JSX.Element {
  const [dateErrors, setDateErrors] = React.useState<FieldError[]>([]);
  const date = useRecoilValue(timeSelector);
  const resetDate = useResetRecoilState(timeSelector);

  React.useEffect(() => {
    return () => {
      resetDate();
    };
  }, []);

  const onChangeDate = (id: string, value: unknown) => {
    const newErrors = [...dateErrors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (dayjs(value as string).isAfter(date)) {
      if (errorIndex < 0) {
        newErrors.push({
          id: id,
          msg: 'No future dates allowed',
        });
      }
    } else {
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1);
      }
    }
    setDateErrors(newErrors);
    refreshErrors(newErrors);
    onChange(id, value as string);
  };

  const getErrorText = (id: string) => {
    const error = dateErrors.find((error) => error.id === id);
    return error ? error.msg : '';
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={4}>
        <DatePicker
          id='collectedDate'
          value={collectedDate}
          onChange={onChangeDate}
          label='Collected on'
          aria-label='collected on'
          maxDate={dayjs(date).format('YYYY-MM-DD')}
          helperText={getErrorText('collectedDate')}
          error={getErrorText('collectedDate') ? true : false}
        />
      </Grid>
      <Grid item xs={4}>
        <DatePicker
          id='receivedDate'
          value={receivedDate}
          onChange={onChangeDate}
          label='Received on'
          aria-label='received on'
          maxDate={dayjs(date).format('YYYY-MM-DD')}
          helperText={getErrorText('receivedDate')}
          error={getErrorText('receivedDate') ? true : false}
        />
      </Grid>
      <Grid item xs={4}></Grid>
    </Grid>
  );
}
