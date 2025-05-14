import React, { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import HighestAndLowestMortalityRateSpeciesCard from './HighestAndLowestMortalityRateSpeciesCard';
import HighestAndLowestMortalityRateZonesCard from './HighestAndLowestMortalityRateZonesCard';
import LiveDeadPlantsPerSpeciesCard from './LiveDeadPlantsPerSpeciesCard';

export default function MortalityRateCard(): JSX.Element {
  const theme = useTheme();
  const { latestResult } = usePlantingSiteData();
  const { isDesktop } = useDeviceInfo();

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
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.MORTALITY_RATE}
          </Typography>
          <Tooltip title={strings.MORTALITY_RATE_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box display='flex' sx={{ flexFlow: 'row wrap' }} marginTop={1}>
          <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
            {latestResult?.mortalityRate !== undefined ? <FormattedNumber value={latestResult.mortalityRate} /> : '-'}
          </Typography>
          {latestResult?.mortalityRate !== undefined && (
            <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
              %
            </Typography>
          )}
        </Box>
        {latestResult?.mortalityRate === undefined && (
          <Box display={'flex'}>
            <Box paddingRight={0.5}>
              <Icon name='warning' fillColor={theme.palette.TwClrIcnWarning} size='medium' />
            </Box>
            <Typography color={theme.palette.TwClrTxtWarning} fontSize='14px' fontWeight={400}>
              {strings.NO_MORTALITY_RATE_WARNING}
            </Typography>
          </Box>
        )}
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.ZONE_MORTALITY}
          </Typography>
          <Tooltip title={strings.ZONE_MORTALITY_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={2}>
          <HighestAndLowestMortalityRateZonesCard />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.SPECIES_MORTALITY}
          </Typography>
          <Tooltip title={strings.SPECIES_MORTALITY_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={2}>
          <HighestAndLowestMortalityRateSpeciesCard />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.MORTALITY_BREAKDOWN}
          </Typography>
          <Tooltip title={strings.MORTALITY_BREAKDOWN_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={2}>
          <LiveDeadPlantsPerSpeciesCard />
        </Box>
      </Box>
    </Card>
  );
}
