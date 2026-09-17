import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import strings from 'src/strings';

type SpeciesCheckCompleteStepProps = {
  namesUpdated: number;
  statusesApplied: number;
  showNames: boolean;
  showStatuses: boolean;
};

const SpeciesCheckCompleteStep = ({
  namesUpdated,
  statusesApplied,
  showNames,
  showStatuses,
}: SpeciesCheckCompleteStepProps): JSX.Element => {
  const theme = useTheme();

  const namesLabel = strings.formatString(
    namesUpdated === 1 ? strings.SPECIES_CHECK_NAME_UPDATED : strings.SPECIES_CHECK_NAMES_UPDATED,
    namesUpdated
  );
  const statusesLabel = strings.formatString(
    statusesApplied === 1 ? strings.SPECIES_CHECK_STATUS_APPLIED : strings.SPECIES_CHECK_STATUSES_APPLIED,
    statusesApplied
  );

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (showNames) {
    rows.push({ label: strings.NAME_CHECK, value: namesLabel });
  }
  if (showStatuses) {
    rows.push({ label: strings.NATIVE_CHECK, value: statusesLabel });
  }

  const summaryRow = (label: string, value: React.ReactNode, withBorder: boolean): JSX.Element => (
    <Box
      key={label}
      sx={{
        alignItems: 'center',
        borderTop: withBorder ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined,
        display: 'flex',
        gap: theme.spacing(2),
        justifyContent: 'space-between',
        padding: theme.spacing(2),
      }}
    >
      <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {label}
      </Typography>
      <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box display='flex' flexDirection='column' alignItems='center' textAlign='center' padding={theme.spacing(3, 0)}>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderRadius: '50%',
          display: 'flex',
          height: 56,
          justifyContent: 'center',
          marginBottom: theme.spacing(2),
          width: 56,
        }}
      >
        <Icon name='checkmark' size='large' fillColor={theme.palette.TwClrIcnSuccess} />
      </Box>
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {strings.SPECIES_CHECK_COMPLETE}
      </Typography>
      <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary} marginTop={theme.spacing(1)}>
        {strings.SPECIES_CHECK_COMPLETE_MESSAGE}
      </Typography>
      {rows.length > 0 && (
        <Box
          sx={{
            border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            marginTop: theme.spacing(3),
            overflow: 'hidden',
            textAlign: 'left',
            width: '60%',
          }}
        >
          {rows.map((row, index) => summaryRow(row.label, row.value, index > 0))}
        </Box>
      )}
    </Box>
  );
};

export default SpeciesCheckCompleteStep;
