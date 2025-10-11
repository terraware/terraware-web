import React, { useCallback, useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import getDateDisplayValue from '@terraware/web-components/utils/date';
import { isValid } from 'date-fns';

import DatePicker from 'src/components/common/DatePicker';
import { useLocalization } from 'src/providers/hooks';
import { FieldNodePayload } from 'src/types/Search';
import { useUserTimeZone } from 'src/utils/useTimeZoneUtils';

const datePickerStyles = {
  '& .MuiInputBase-input': {
    paddingRight: 0,
  },
  maxWidth: '180px',
};

interface DateRangeProps {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  onDelete: () => void;
  values: (string | null)[];
}

export default function DateRange({ field, onChange, onDelete, values }: DateRangeProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const userTimeZone = useUserTimeZone();

  const [startDate, setStartDate] = useState(values[0]);
  const [endDate, setEndDate] = useState(values[1]);

  useEffect(() => {
    setStartDate(values[0] || null);
    setEndDate(values[1] || null);
  }, [values]);

  const getOnChangeDate = useCallback(
    (id: string) => (value?: Date | null) => {
      const newValues = [startDate, endDate];
      const date = value && isValid(value) ? getDateDisplayValue(value, userTimeZone?.id) : null;
      if (id === 'startDate' && date) {
        setStartDate(date);
        newValues[0] = date;
      }
      if (id === 'endDate' && date) {
        setEndDate(date);
        newValues[1] = date;
      }

      if (newValues[0] || newValues[1]) {
        const newFilter: FieldNodePayload = {
          field,
          operation: 'field',
          type: 'Range',
          values: newValues,
        };

        onChange(newFilter);
      } else {
        onDelete();
      }
    },
    [startDate, endDate, userTimeZone?.id, field, onChange, onDelete]
  );

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' sx={{ marginBottom: theme.spacing(3) }}>
      <Box alignItems='center' display='flex' flexDirection='row'>
        <DatePicker
          aria-label={strings.START_DATE}
          defaultTimeZone={userTimeZone?.id}
          id='startDate'
          label=''
          onChange={getOnChangeDate('startDate')}
          sx={datePickerStyles}
          value={startDate}
        />

        <Typography paddingX={theme.spacing(1)}>to</Typography>
      </Box>

      <Box alignItems='center' display='flex' flexDirection='row'>
        <DatePicker
          aria-label={strings.END_DATE}
          defaultTimeZone={userTimeZone?.id}
          id='endDate'
          label=''
          onChange={getOnChangeDate('endDate')}
          sx={datePickerStyles}
          value={endDate}
        />
      </Box>
    </Box>
  );
}
