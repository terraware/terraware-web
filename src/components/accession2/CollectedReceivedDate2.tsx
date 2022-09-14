import React, { useCallback, useState, useEffect } from 'react';
import { useTheme, Grid } from '@mui/material';
import { DatePicker } from '@terraware/web-components';
import { Accession2, AccessionPostRequestBody } from 'src/api/accessions2/accession';
import strings from 'src/strings';

interface Props {
  onChange: (id: string, value: string) => void;
  record: Accession2 | AccessionPostRequestBody;
  type: 'collected' | 'received';
  validate?: boolean;
}

export type Dates = {
  collectedDate?: any;
  receivedDate?: any;
};

export default function CollecteReceivedDate2({ onChange, record, type, validate }: Props): JSX.Element {
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
    (id: string, value?: any) => {
      const date = new Date(value).getTime();
      const now = Date.now();

      setDateError(id, '');

      if (!value || isNaN(date)) {
        const required = validate && !value;
        setDateError(id, required ? strings.REQUIRED_FIELD : strings.INVALID_DATE);
        return false;
      } else if (date > now) {
        setDateError(id, strings.NO_FUTURE_DATES);
        return false;
      } else {
        return true;
      }
    },
    [validate]
  );

  const changeDate = (id: string, value?: any) => {
    setDates((curr) => ({ ...curr, [id]: value }));

    const valid = validateDate(id, value);
    onChange(id, valid ? value : '');
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
          onChange={changeDate}
          errorText={dateErrors.collectedDate}
          maxDate={Date.now()}
        />
      ) : (
        <DatePicker
          id='receivedDate'
          label={strings.RECEIVING_DATE_REQUIRED}
          aria-label={strings.RECEIVING_DATE_REQUIRED}
          value={dates.receivedDate}
          onChange={changeDate}
          errorText={dateErrors.receivedDate}
        />
      )}
    </Grid>
  );
}
