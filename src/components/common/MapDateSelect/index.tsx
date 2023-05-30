import DateSlider from './DateSlider';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';

type MapDateSelectProps = {
  dates: string[]; // date strings in the format 'YYYY-MM-DD'
  onChange: (newDate: string) => void;
};

export default function MapDateSelect({ dates, onChange }: MapDateSelectProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization().selectedLocale;

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

  const latestDateIndex = useMemo(() => {
    return dates.findIndex((d) => d === latestDate);
  }, [dates, latestDate]);

  const [selectedDate, setSelectedDate] = useState(latestDate);

  const handleChange = (newDate: string) => {
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const getDateString = (date: string) => {
    return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
  };
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
