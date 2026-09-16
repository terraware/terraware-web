import React, { type JSX, useCallback } from 'react';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';

const datePickerStyles = {
  flex: '1 1 140px',
  maxWidth: '180px',
  minWidth: '120px',
};

const ObservationFilterPanel = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { dateFilter, plotType, setDateFilter, setFiltersExpanded } = useObservationFilters();

  const onFromChange = useCallback(
    (value?: DateTime) => setDateFilter((current) => ({ ...current, from: value?.toFormat('yyyy-MM-dd') })),
    [setDateFilter]
  );

  const onToChange = useCallback(
    (value?: DateTime) => setDateFilter((current) => ({ ...current, to: value?.toFormat('yyyy-MM-dd') })),
    [setDateFilter]
  );

  return (
    <Box
      sx={{
        alignItems: 'flex-end',
        background: theme.palette.TwClrBgInfoTertiary,
        border: `1px solid ${theme.palette.TwClrBrdrInfo}`,
        borderRadius: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
      }}
    >
      <Box>
        <Typography fontSize='14px' fontWeight={500} marginBottom={theme.spacing(0.5)}>
          {plotType === 'adHoc' ? strings.DATE_OBSERVED : strings.OBSERVATION_DATE}
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) }}>
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
      <IconButton
        aria-label={strings.HIDE_FILTERS}
        id='close-observation-filters'
        onClick={() => setFiltersExpanded(false)}
        size='small'
        sx={{ marginLeft: 'auto' }}
      >
        <Icon name='close' size='small' />
      </IconButton>
    </Box>
  );
};

export default ObservationFilterPanel;
