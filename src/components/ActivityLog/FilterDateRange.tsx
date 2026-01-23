import React, { type JSX, ReactNode, useCallback, useEffect, useState } from 'react';

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
  minWidth: '180px',
  maxWidth: '180px',
};

interface DateRangeProps {
  field: string;
  iconFilters?: ReactNode;
  exportButton: ReactNode;
  onChange: (filter: FieldNodePayload) => void;
  onDelete: () => void;
  rightComponent?: ReactNode;
  values: (string | null)[];
}

export default function DateRange({
  field,
  iconFilters,
  exportButton,
  onChange,
  onDelete,
  rightComponent,
  values,
}: DateRangeProps): JSX.Element {
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
      if (id === 'startDate') {
        setStartDate(date);
        newValues[0] = date;
      } else if (id === 'endDate') {
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
    [endDate, field, onChange, onDelete, startDate, userTimeZone?.id]
  );

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap'>
      <Box display='flex' flexDirection='row' justifyContent='center' marginBottom={theme.spacing(2)}>
        <DatePicker
          aria-label={strings.START_DATE}
          defaultTimeZone={userTimeZone?.id}
          id='startDate'
          label=''
          onChange={getOnChangeDate('startDate')}
          sx={datePickerStyles}
          value={startDate}
        />
        <Typography lineHeight='40px' paddingX='14px'>
          {strings.TO.toLowerCase()}
        </Typography>
      </Box>

      <Box display='flex' flexDirection='row' justifyContent='center' marginBottom={theme.spacing(2)}>
        <DatePicker
          aria-label={strings.END_DATE}
          defaultTimeZone={userTimeZone?.id}
          id='endDate'
          label=''
          onChange={getOnChangeDate('endDate')}
          sx={datePickerStyles}
          value={endDate}
        />
        {iconFilters}
        {exportButton}
      </Box>

      {rightComponent && (
        <Box display='flex' flexDirection='row' justifyContent='center' marginBottom={theme.spacing(2)}>
          {rightComponent}
        </Box>
      )}
    </Box>
  );
}
