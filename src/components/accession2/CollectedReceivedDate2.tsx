import { useTheme, Grid } from '@mui/material';
import { DatePicker } from '@terraware/web-components';
import React, { useState } from 'react';
import { Accession2, AccessionPostRequestBody } from 'src/api/accessions2/accession';
import strings from 'src/strings';

interface Props {
  onChange: (id: string, value: string) => void;
  record: Accession2 | AccessionPostRequestBody;
  type: 'collected' | 'received';
}

export type Dates = {
  collectedDate?: any;
  receivedDate?: any;
};

export default function CollecteReceivedDate2({ onChange, record, type }: Props): JSX.Element {
  const theme = useTheme();

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

  const changeDate = (id: string, value?: any) => {
    setDates((curr) => ({ ...curr, [id]: value }));
    const date = new Date(value).getTime();
    const now = Date.now();
    if (isNaN(date) || date > now) {
      return;
    } else {
      onChange(id, value);
    }
  };

  return (
    <Grid item xs={12} sx={datePickerStyle}>
      {type === 'collected' ? (
        <DatePicker
          id='collectedDate'
          label={strings.COLLECTION_DATE_REQUIRED}
          aria-label={strings.COLLECTION_DATE_REQUIRED}
          value={dates.collectedDate}
          onChange={changeDate}
        />
      ) : (
        <DatePicker
          id='receivedDate'
          label={strings.RECEIVING_DATE_REQUIRED}
          aria-label={strings.RECEIVING_DATE_REQUIRED}
          value={dates.receivedDate}
          onChange={changeDate}
        />
      )}
    </Grid>
  );
}
