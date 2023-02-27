import React, { useCallback, useState, useEffect } from 'react';
import { useTheme, Grid } from '@mui/material';
import DatePicker from 'src/components/common/DatePicker';
import getDateDisplayValue, { isInTheFuture } from '@terraware/web-components/utils/date';
import strings from 'src/strings';

interface Props {
  onChange: (id: string, value: string) => void;
  id: string;
  validate?: boolean;
  timeZone: string;
  label: string;
  onDateError: (error: string) => void;
  dateError?: string;
  maxDate?: Date;
  value?: string;
}

export type Dates = {
  collectedDate?: any;
  receivedDate?: any;
};

export default function CollectedReceivedDate2({
  id,
  label,
  onChange,
  validate,
  timeZone,
  dateError,
  maxDate,
  onDateError,
  value,
}: Props): JSX.Element {
  const theme = useTheme();
  const [dateValue, setDateValue] = useState(value);

  const datePickerStyle = {
    '.MuiFormControl-root': {
      width: '100%',
    },
    marginTop: theme.spacing(2),
  };

  const validateDate = useCallback(
    (value?: string | undefined) => {
      onDateError('');
      if (!value) {
        const required = validate && value === undefined;
        onDateError(required ? strings.REQUIRED_FIELD : strings.INVALID_DATE);
        return false;
      } else if (isInTheFuture(value, timeZone)) {
        onDateError(strings.NO_FUTURE_DATES);
        return false;
      } else {
        return true;
      }
    },
    [timeZone, validate, onDateError]
  );

  const changeDate = (value?: any) => {
    setDateValue(value);

    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    if (date) {
      onChange(id, date);
    }
  };

  useEffect(() => {
    validateDate(dateValue);
  }, [validate, dateValue, validateDate]);

  const onErrorHandler = (value: any) => {
    setDateValue(value);
  };

  return (
    <Grid item xs={12} sx={datePickerStyle}>
      <DatePicker
        id={id}
        label={label}
        aria-label={label}
        value={dateValue}
        onChange={(value) => changeDate(value)}
        errorText={validate ? dateError : ''}
        maxDate={maxDate}
        defaultTimeZone={timeZone}
        onError={(reason, value) => onErrorHandler(value)}
      />
    </Grid>
  );
}
