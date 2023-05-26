import DateSlider from './DateSlider';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import Card from 'src/components/common/Card';

type MapDateSelectProps = {
  dates: Date[];
  onChange: (newDate: Date) => void;
};

export default function MapDateSelect({ dates, onChange }: MapDateSelectProps): JSX.Element {
  const theme = useTheme();

  const monthStrings = [
    strings.MONTH_01,
    strings.MONTH_02,
    strings.MONTH_03,
    strings.MONTH_04,
    strings.MONTH_05,
    strings.MONTH_06,
    strings.MONTH_07,
    strings.MONTH_08,
    strings.MONTH_09,
    strings.MONTH_10,
    strings.MONTH_11,
    strings.MONTH_12,
  ];

  const earliestDate = useMemo(() => {
    return dates.reduce((prev, curr) => {
      if (prev.getTime() < curr.getTime()) {
        return prev;
      }
      return curr;
    });
  }, [dates]);

  const latestDate = useMemo(() => {
    return dates.reduce((prev, curr) => {
      if (prev.getTime() > curr.getTime()) {
        return prev;
      }
      return curr;
    });
  }, [dates]);

  const latestDateIndex = useMemo(() => {
    return dates.findIndex((d) => d === latestDate);
  }, [dates, latestDate]);

  const [selectedDate, setSelectedDate] = useState(latestDate);

  const handleChange = (newDate: Date) => {
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const getDateString = (date: Date) => {
    return `${monthStrings[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };
  const getDateLabel = (date: Date) => <Typography fontSize='12px'>{getDateString(date)}</Typography>;

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
          <DateSlider dates={dates} onChange={handleChange} initialSelectionIndex={latestDateIndex} />
          <Box display='flex' justifyContent='space-between'>
            {getDateLabel(earliestDate)}
            {getDateLabel(latestDate)}
          </Box>
        </>
      )}
    </Card>
  );
}
