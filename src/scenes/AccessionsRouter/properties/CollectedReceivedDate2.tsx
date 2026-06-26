import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import getDateDisplayValue, { isInTheFuture } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';

interface Props {
  dateError?: string;
  id: string;
  label: string;
  maxDate?: Date;
  includeTime?: boolean;
  onChange: (id: string, value: string | null) => void;
  onDateError: (error: string) => void;
  timeZone: string;
  validate?: boolean;
  value?: string;
}

export default function CollectedReceivedDate2({
  dateError,
  id,
  label,
  includeTime = false,
  maxDate,
  onChange,
  onDateError,
  timeZone,
  validate,
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

  const changeDateTime = (newValue?: DateTime) => {
    const formattedValue = newValue
      ? includeTime
        ? newValue.toUTC().toISO() ?? undefined
        : getDateDisplayValue(newValue.toMillis(), timeZone)
      : undefined;

    setDateValue(formattedValue);
    onChange(id, formattedValue ?? null);
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
        onDateChange={(newValue) => changeDateTime(newValue)}
        errorText={validate ? dateError : ''}
        maxDate={maxDate}
        defaultTimeZone={timeZone}
        showTime={includeTime}
      />
    </Grid>
  );
}
