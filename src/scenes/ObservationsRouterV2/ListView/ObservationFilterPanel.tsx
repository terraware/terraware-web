import React, { type JSX, useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';

const datePickerStyles = {
  maxWidth: '180px',
  minWidth: '180px',
};

const ObservationFilterPanel = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { dateFilter, plotType, setDateFilter } = useObservationFilters();

  const onFromChange = useCallback(
    (value?: DateTime) => setDateFilter({ ...dateFilter, from: value?.toFormat('yyyy-MM-dd') }),
    [dateFilter, setDateFilter]
  );

  const onToChange = useCallback(
    (value?: DateTime) => setDateFilter({ ...dateFilter, to: value?.toFormat('yyyy-MM-dd') }),
    [dateFilter, setDateFilter]
  );

  return (
    <Box sx={{ alignItems: 'flex-end', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2) }}>
      <Box>
        <Typography fontSize='14px' fontWeight={500} marginBottom={theme.spacing(0.5)}>
          {plotType === 'adHoc' ? strings.DATE_OBSERVED : strings.OBSERVATION_DATE}
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(1) }}>
          <DatePicker
            aria-label={strings.START_DATE}
            id='observation-date-from'
            label=''
            onDateChange={onFromChange}
            sx={datePickerStyles}
            value={dateFilter.from ?? null}
          />
          <Typography>{'–'}</Typography>
          <DatePicker
            aria-label={strings.END_DATE}
            id='observation-date-to'
            label=''
            onDateChange={onToChange}
            sx={datePickerStyles}
            value={dateFilter.to ?? null}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ObservationFilterPanel;
