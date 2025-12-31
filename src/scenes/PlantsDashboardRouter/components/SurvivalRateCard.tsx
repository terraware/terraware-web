import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import HighestAndLowestSurvivalRateSpeciesCard from './HighestAndLowestSurvivalRateSpeciesCard';
import HighestAndLowestSurvivalRateStrataCard from './HighestAndLowestSurvivalRateStrataCard';
import LiveDeadPlantsPerSpeciesCard from './LiveDeadPlantsPerSpeciesCard';

export default function SurvivalRateCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries, plantingSite } = usePlantingSiteData();
  const { isDesktop } = useDeviceInfo();

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  const latestSummary = useMemo(
    () => (observationSummaries && observationSummaries.length > 0 ? observationSummaries[0] : undefined),
    [observationSummaries]
  );

  return (
    <Card
      radius='8px'
      style={{ display: 'flex', 'justify-content': 'space-between', flexDirection: isDesktop ? 'row' : 'column' }}
    >
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.SURVIVAL_RATE}
          </Typography>
          <Tooltip title={strings.SURVIVAL_RATE_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box display='flex' sx={{ flexFlow: 'row wrap' }} marginTop={1}>
          {latestSummary?.survivalRate !== undefined ? (
            <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
              <FormattedNumber value={latestSummary.survivalRate} />
            </Typography>
          ) : (
            <Typography fontSize='20px' fontWeight={500}>
              {strings.CANNOT_BE_CALCULATED}
            </Typography>
          )}
          {latestSummary?.survivalRate !== undefined && (
            <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
              %
            </Typography>
          )}
        </Box>

        {latestSummary?.survivalRate === undefined && (
          <Box>
            {plantingSite?.id && (
              <Typography>
                {strings.formatString(
                  strings.SET_T0_DATA_IN_THE,
                  <Link
                    fontSize='16px'
                    to={APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSite.id.toString())}
                  >
                    {strings.SURVIVAL_RATE_SETTINGS}
                  </Link>
                )}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.ZONE_SURVIVAL}
          </Typography>
          <Tooltip title={strings.ZONE_SURVIVAL_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={2}>
          <HighestAndLowestSurvivalRateStrataCard />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.SPECIES_SURVIVAL}
          </Typography>
          <Tooltip title={strings.SPECIES_SURVIVAL_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={2}>
          <HighestAndLowestSurvivalRateSpeciesCard />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.SPECIES_SURVIVAL_BREAKDOWN}
          </Typography>
          <Tooltip title={strings.SPECIES_SURVIVAL_BREAKDOWN_TOOLTIP}>
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
