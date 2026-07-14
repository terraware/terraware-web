import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import NurserySummaryService, { NurserySummaryPayload } from 'src/services/NurserySummaryService';
import strings from 'src/strings';

type NurseryLocationMapDrawerProps = {
  nurseryId: number;
  nurseryName: string;
};

// A space after slashs
const withSlashBreaks = (label: string): string => label.replace(/\//g, '/ ');

export default function NurseryLocationMapDrawer({
  nurseryId,
  nurseryName,
}: NurseryLocationMapDrawerProps): JSX.Element {
  const theme = useTheme();
  const [summary, setSummary] = useState<NurserySummaryPayload | undefined>();

  useEffect(() => {
    let active = true;
    const fetchSummary = async () => {
      const response = await NurserySummaryService.getNurserySummary(nurseryId);
      if (active && response.requestSucceeded) {
        setSummary(response);
      }
    };
    void fetchSummary();
    return () => {
      active = false;
    };
  }, [nurseryId]);

  const rows = useMemo(
    () => [
      { label: strings.TOTAL_PLANTS, value: summary?.totalQuantity ?? 0 },
      { label: strings.GERMINATION_ESTABLISHMENT, value: summary?.germinatingQuantity ?? 0 },
      { label: strings.ACTIVE_GROWTH, value: summary?.activeGrowthQuantity ?? 0 },
      { label: strings.HARDENING_OFF, value: summary?.hardeningOffQuantity ?? 0 },
      { label: strings.READY_TO_PLANT, value: summary?.readyQuantity ?? 0 },
    ],
    [summary]
  );

  return (
    <Box display='flex' flexDirection='column'>
      <Box bgcolor={theme.palette.TwClrBgSecondary} padding={theme.spacing(1)}>
        <Typography fontSize='20px' fontWeight={600}>
          {nurseryName}
        </Typography>
      </Box>
      {rows.map((row, index) => {
        const fontWeight = row.label === strings.TOTAL_PLANTS ? 600 : 400;
        return (
          <Box
            key={row.label}
            display='flex'
            justifyContent='space-between'
            alignItems='baseline'
            padding={theme.spacing(1)}
            bgcolor={index % 2 === 1 ? theme.palette.TwClrBgSecondary : undefined}
          >
            <Typography
              fontSize='16px'
              fontWeight={fontWeight}
              sx={{ flex: 1, minWidth: 0, marginRight: theme.spacing(1) }}
            >
              {withSlashBreaks(row.label)}
            </Typography>
            <Typography fontSize='16px' fontWeight={fontWeight} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              <FormattedNumber value={row.value} />
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
