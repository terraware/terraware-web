import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Card, Typography, useTheme } from '@mui/material';
import { Slider } from '@terraware/web-components';
import { getShortDate } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

export type MapDateSliderControlProps = {
  dates: DateTime[]; // date strings in the format 'YYYY-MM-DD'
  selectedDate: DateTime;
  onChange: (newDate: DateTime) => void;
};

const MapDateSliderControl = ({ dates, selectedDate, onChange }: MapDateSliderControlProps): JSX.Element => {
  const theme = useTheme();

  const earliestDate = useMemo(() => {
    return dates.reduce((earliest, current) => {
      return current < earliest ? current : earliest;
    });
  }, [dates]);

  const latestDate = useMemo(() => {
    return dates.reduce((latest, current) => {
      return current > latest ? current : latest;
    });
  }, [dates]);

  const marks = useMemo(() => {
    return dates.map((date) => ({ value: date.valueOf() }));
  }, [dates]);

  const getDateString = (date: DateTime) => getShortDate(date);

  const getDateLabel = (date: DateTime) => <Typography fontSize='12px'>{getDateString(date)}</Typography>;

  const onDateChange = useCallback(
    (value: number) => {
      onChange(DateTime.fromMillis(value));
    },
    [onChange]
  );

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
          <Slider
            value={selectedDate.valueOf()}
            min={earliestDate.valueOf()}
            max={latestDate.valueOf()}
            marks={marks}
            valueLabelDisplay='off'
            onChange={onDateChange}
          />
          <Box display='flex' justifyContent='space-between'>
            {getDateLabel(earliestDate)}
            {getDateLabel(latestDate)}
          </Box>
        </>
      )}
    </Card>
  );
};

export default MapDateSliderControl;
