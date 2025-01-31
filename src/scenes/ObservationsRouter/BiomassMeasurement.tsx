import React from 'react';

import { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import strings from 'src/strings';

export default function BiomassMeasurement(): JSX.Element {
  const theme = useTheme();

  return (
    <Card>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
          marginBottom: theme.spacing(2),
        }}
      >
        {strings.BIOMASS_MEASUREMENT}
      </Typography>
      <Card style={{ margin: '56px auto 0', borderRadius: '24px', height: 'fit-content' }}>
        <EmptyStateContent
          title={''}
          subtitle={[strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2]}
        />
      </Card>
    </Card>
  );
}
