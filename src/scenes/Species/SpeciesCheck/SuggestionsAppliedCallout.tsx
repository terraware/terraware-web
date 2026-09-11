import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import strings from 'src/strings';

type SuggestionsAppliedCalloutProps = {
  applied: number;
  total: number;
};

const SuggestionsAppliedCallout = ({ applied, total }: SuggestionsAppliedCalloutProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: theme.palette.TwClrBgSuccessTertiary,
        border: `1px solid ${theme.palette.TwClrBrdrSuccess}`,
        borderRadius: theme.spacing(1),
        display: 'flex',
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5, 2),
      }}
    >
      <Icon name='success' size='medium' fillColor={theme.palette.TwClrIcnSuccess} />
      <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt}>
        {strings.formatString(strings.SPECIES_CHECK_SUGGESTIONS_APPLIED, applied, total)}
      </Typography>
    </Box>
  );
};

export default SuggestionsAppliedCallout;
