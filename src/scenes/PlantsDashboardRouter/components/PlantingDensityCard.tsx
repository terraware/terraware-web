import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import PlantingDensityPerStratumCard from './PlantingDensityPerStratumCard';
import PlantingSiteDensityCard from './PlantingSiteDensityCard';

type PlantingDensityCardProps = {
  hasObservations: boolean;
};

export default function PlantingDensityCard({ hasObservations }: PlantingDensityCardProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { plantingSite } = usePlantingSiteData();

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  return (
    <Card
      radius='8px'
      style={{ display: 'flex', 'justify-content': 'space-between', flexDirection: isDesktop ? 'row' : 'column' }}
    >
      {plantingSite && plantingSite.id !== -1 && (
        <>
          {hasObservations && (
            <>
              <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
                <Box display={'flex'} alignItems={'center'}>
                  <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
                    {strings.OBSERVED_DENSITY}
                  </Typography>
                  <Tooltip title={strings.OBSERVED_DENSITY_TOOLTIP}>
                    <Box display='flex'>
                      <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                    </Box>
                  </Tooltip>
                </Box>
                <Box paddingTop={2}>
                  <PlantingSiteDensityCard />
                </Box>
              </Box>
              <div style={separatorStyles} />
            </>
          )}
          <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
            <Box display={'flex'} alignItems={'center'}>
              <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
                {strings.OBSERVED_DENSITY_PER_STRATUM}
              </Typography>
              <Tooltip title={strings.OBSERVED_DENSITY_TOOLTIP}>
                <Box display='flex'>
                  <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                </Box>
              </Tooltip>
            </Box>
            <Box paddingTop={1}>
              <PlantingDensityPerStratumCard />
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
}
