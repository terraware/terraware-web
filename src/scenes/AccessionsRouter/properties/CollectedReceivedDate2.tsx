import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import getDateDisplayValue, { isInTheFuture } from '@terraware/web-components/utils/date';

import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';

interface Props {
  onChange: (id: string, value: string | null) => void;
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
    (newValue?: string | undefined) => {
      onDateError('');
      if (!newValue) {
        const required = validate && newValue === undefined;
        onDateError(required ? strings.REQUIRED_FIELD : strings.INVALID_DATE);
        return false;
      } else if (isInTheFuture(newValue, timeZone)) {
        onDateError(strings.NO_FUTURE_DATES);
        return false;
      } else {
        return true;
      }
    },
    [timeZone, validate, onDateError]
  );

  const changeDate = (newValue?: any) => {
    setDateValue(newValue);

    const date = newValue ? getDateDisplayValue(newValue.getTime(), timeZone) : null;

    onChange(id, date);
  };

  useEffect(() => {
    validateDate(dateValue);
  }, [validate, dateValue, validateDate]);

  return (
    <Grid item xs={12} sx={datePickerStyle}>
      <DatePicker
        id={id}
        label={label}
        aria-label={label}
        value={dateValue}
        onChange={(newValue) => changeDate(newValue)}
        errorText={validate ? dateError : ''}
        maxDate={maxDate}
        defaultTimeZone={timeZone}
      />
    </Grid>
  );
}
