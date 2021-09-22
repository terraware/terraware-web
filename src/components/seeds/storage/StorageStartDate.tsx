import { Grid } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import timeSelector from '../../../state/selectors/time';
import strings from '../../../strings';
import DatePicker from '../../common/DatePicker';

interface Props {
  onChange: (id: string, value: string) => void;
  refreshErrors: (newErrors: FieldError[]) => void;
  storageDate?: string;
}

type FieldError = {
  id: string;
  msg: string;
};
export function StorageStartDate({
  onChange,
  refreshErrors,
  storageDate,
}: Props): JSX.Element {
  const [dateErrors, setDateErrors] = React.useState<FieldError[]>([]);
  const date = useRecoilValue(timeSelector);
  const resetDate = useResetRecoilState(timeSelector);

  React.useEffect(() => {
    return () => {
      resetDate();
    };
  }, [resetDate]);

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
    <Grid item xs={4}>
      <DatePicker
        id='storageStartDate'
        value={storageDate}
        onChange={onChangeDate}
        label={strings.STARTING_ON}
        aria-label='Starting on'
        maxDate={moment(date).format('YYYY-MM-DD')}
        helperText={getErrorText('storageStartDate')}
        error={getErrorText('storageStartDate') ? true : false}
      />
    </Grid>
  );
}
