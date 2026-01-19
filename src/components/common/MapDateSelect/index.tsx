import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { getShortDate } from 'src/utils/dateFormatter';

import DateSlider from './DateSlider';

type MapDateSelectProps = {
  dates: string[]; // date strings in the format 'YYYY-MM-DD'
  selectedDate: string;
  onChange: (newDate?: string) => void;
};

export default function MapDateSelect({ dates, selectedDate, onChange }: MapDateSelectProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization().activeLocale;

  const earliestDate = useMemo(() => {
    return dates.reduce((prev, curr) => {
      if (Date.parse(prev) < Date.parse(curr)) {
        return prev;
      }
      return curr;
    });
  }, [dates]);

  const latestDate = useMemo(() => {
    return dates.reduce((prev, curr) => {
      if (Date.parse(prev) > Date.parse(curr)) {
        return prev;
      }
      return curr;
    });
  }, [dates]);

  const getDateString = (date: string) => getShortDate(date, locale);

  const getDateLabel = (date: string) => <Typography fontSize='12px'>{getDateString(date)}</Typography>;

  return (
    <Card
      style={{
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
        maxWidth: '270px',
        width: dates.length > 1 ? '270px' : undefined,
      }}
    >
      {selectedDate && (
        <Typography fontSize='14px' fontWeight={600} textAlign='right'>
          {getDateString(selectedDate)}
        </Typography>
      )}
      {dates.length > 1 && (
        <>
          <DateSlider dates={dates} onChange={onChange} selection={selectedDate} />
          <Box display='flex' justifyContent='space-between'>
            {getDateLabel(earliestDate)}
            {getDateLabel(latestDate)}
          </Box>
        </>
      )}
    </Card>
  );
}
