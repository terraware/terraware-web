import React, { useCallback, useState, useEffect } from 'react';
import { useTheme, Grid } from '@mui/material';
import DatePicker from 'src/components/common/DatePicker';
import { Accession } from 'src/types/Accession';
import { AccessionPostRequestBody } from 'src/services/SeedBankService';
import getDateDisplayValue, { isInTheFuture } from '@terraware/web-components/utils/date';
import strings from 'src/strings';

interface Props {
  onChange: (id: string, value: string) => void;
  record: Accession | AccessionPostRequestBody;
  type: 'collected' | 'received';
  validate?: boolean;
  timeZone: string;
}

export type Dates = {
  collectedDate?: any;
  receivedDate?: any;
};

export default function CollectedReceivedDate2({ onChange, record, type, validate, timeZone }: Props): JSX.Element {
  const theme = useTheme();

  const [dateErrors, setDateErrors] = useState<{ [key: string]: string | undefined }>({});
  const [dates, setDates] = useState<Dates>({
    collectedDate: record.collectedDate,
    receivedDate: record.receivedDate,
  });

  const datePickerStyle = {
    '.MuiFormControl-root': {
      width: '100%',
    },
    marginTop: theme.spacing(2),
  };

  const setDateError = (id: string, error?: string) => {
    setDateErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateDate = useCallback(
    (id: string, value?: string | undefined) => {
      setDateError(id, '');
      if (!value) {
        const required = validate && value === undefined;
        setDateError(id, required ? strings.REQUIRED_FIELD : strings.INVALID_DATE);
        return false;
      } else if (isInTheFuture(value, timeZone)) {
        setDateError(id, strings.NO_FUTURE_DATES);
        return false;
      } else {
        return true;
      }
    },
    [timeZone, validate]
  );

  const changeDate = (id: string, value?: any) => {
    setDates((curr) => ({ ...curr, [id]: value }));

    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    if (date) {
      onChange(id, date);
    }
  };

  useEffect(() => {
    if (validate) {
      validateDate('collectedDate', dates.collectedDate);
      validateDate('receivedDate', dates.receivedDate);
    }
  }, [validate, dates.collectedDate, dates.receivedDate, validateDate]);

  return (
    <Grid item xs={12} sx={datePickerStyle}>
      {type === 'collected' ? (
        <DatePicker
          id='collectedDate'
          label={strings.COLLECTION_DATE_REQUIRED}
          aria-label={strings.COLLECTION_DATE_REQUIRED}
          value={dates.collectedDate}
          onChange={(value) => changeDate('collectedDate', value)}
          errorText={dateErrors.collectedDate}
          maxDate={new Date()}
          defaultTimeZone={timeZone}
        />
      ) : (
        <DatePicker
          id='receivedDate'
          label={strings.RECEIVING_DATE_REQUIRED}
          aria-label={strings.RECEIVING_DATE_REQUIRED}
          value={dates.receivedDate}
          onChange={(value) => changeDate('receivedDate', value)}
          errorText={dateErrors.receivedDate}
          defaultTimeZone={timeZone}
        />
      )}
    </Grid>
  );
}
