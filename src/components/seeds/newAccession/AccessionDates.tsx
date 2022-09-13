import { Grid } from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { getDate } from 'src/api/clock';
import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface Props {
  onChange: (id: string, value: string) => void;
  refreshErrors: (newErrors: FieldError[]) => void;
  collectedDate?: string;
  receivedDate?: string;
  disabled: boolean;
}

type FieldError = {
  id: string;
  msg: string;
};
export function AccessionDates({ onChange, refreshErrors, collectedDate, receivedDate, disabled }: Props): JSX.Element {
  const [dateErrors, setDateErrors] = useState<FieldError[]>([]);
  const [date, setDate] = useState<number>();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const populateDate = async () => {
      const response = await getDate();
      setDate(response.serverTime ? response.serverTime : response.localTime);
    };
    populateDate();
  }, []);

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const onChangeDate = (id: string, value: unknown) => {
    const newErrors = [...dateErrors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (moment(value as string).isAfter(date)) {
      if (errorIndex < 0) {
        newErrors.push({
          id,
          msg: strings.NO_FUTURE_DATES,
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
    const error = dateErrors.find((_error) => _error.id === id);

    return error ? error.msg : '';
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={gridSize()}>
        <DatePicker
          id='collectedDate'
          value={collectedDate}
          onChange={onChangeDate}
          label={strings.COLLECTED_ON}
          aria-label='collected on'
          maxDate={moment(date).format('YYYY-MM-DD')}
          helperText={getErrorText('collectedDate')}
          errorText={getErrorText('collectedDate')}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={gridSize()}>
        <DatePicker
          id='receivedDate'
          value={receivedDate}
          onChange={onChangeDate}
          label={strings.RECEIVED_ON}
          aria-label='received on'
          maxDate={moment(date).format('YYYY-MM-DD')}
          helperText={getErrorText('receivedDate')}
          errorText={getErrorText('receivedDate')}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={4} />
    </Grid>
  );
}
