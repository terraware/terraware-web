import React, { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import HighestAndLowestMortalityRateSpeciesCard from './HighestAndLowestMortalityRateSpeciesCard';
import HighestAndLowestMortalityRateZonesCard from './HighestAndLowestMortalityRateZonesCard';
import LiveDeadPlantsPerSpeciesCard from './LiveDeadPlantsPerSpeciesCard';

type MortalityRateCardProps = {
  plantingSiteId: number;
};

export default function MortalityRateCard({ plantingSiteId }: MortalityRateCardProps): JSX.Element {
  const theme = useTheme();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );
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
          <Typography fontSize='84px' fontWeight={600} lineHeight={1}>
            <FormattedNumber value={observation?.mortalityRate || 0} />
          </Typography>
          <Typography fontSize='84px' fontWeight={600} lineHeight={1}>
            %
          </Typography>
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.ZONE_MORTALITY}
          </Typography>
        </Box>
        <Box paddingTop={2}>
          <HighestAndLowestMortalityRateZonesCard plantingSiteId={plantingSiteId} />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.SPECIES_MORTALITY}
          </Typography>
        </Box>
        <Box paddingTop={2}>
          <HighestAndLowestMortalityRateSpeciesCard plantingSiteId={plantingSiteId} />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.MORTALITY_BREAKDOWN}
          </Typography>
        </Box>
        <Box paddingTop={2}>
          <LiveDeadPlantsPerSpeciesCard plantingSiteId={plantingSiteId} />
        </Box>
      </Box>
    </Card>
  );
}
