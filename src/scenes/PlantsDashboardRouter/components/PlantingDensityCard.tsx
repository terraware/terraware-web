import { useMemo } from 'react';

import React, { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import PlantingDensityPerZoneCard from './PlantingDensityPerZoneCard';
import PlantingSiteDensityCard from './PlantingSiteDensityCard';

type PlantingDensityCardProps = {
  plantingSiteId: number;
  sitePlantingComplete: boolean;
};

export default function PlantingDensityCard({ plantingSiteId }: PlantingDensityCardProps): JSX.Element {
  const theme = useTheme();

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  const totalArea = plantingSite?.areaHa ?? 0;
  const totalPlantedArea = useMemo(() => {
    return (
      plantingSite?.plantingZones
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0
    );
  }, [plantingSite]);
  const percentagePlanted = totalArea > 0 ? Math.round((totalPlantedArea / totalArea) * 100) : 0;

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  return (
    <Card radius='8px' style={{ display: 'flex', 'justify-content': 'space-between' }}>
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.PLANTING_COMPLETE_DASHBOARD}
          </Typography>
          <Tooltip title={strings.PLANTING_COMPLETE_DASHBOARD_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box marginTop={2}>
          <Typography fontSize='48px' fontWeight={600} lineHeight={1} marginBottom={2}>
            <FormattedNumber value={Math.round(totalPlantedArea) || 0} />
          </Typography>
          <Typography fontSize='16px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)}>
            {strings.HECTARES}
          </Typography>
          <Typography fontSize='20px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)} textAlign='right'>
            {strings.formatString(strings.PERCENTAGE_OF_SITE_PLANTED, percentagePlanted)}
          </Typography>
          <ProgressChart value={totalPlantedArea} target={totalArea} />
          <Typography
            fontSize='16px'
            fontWeight={600}
            lineHeight={1}
            marginTop={theme.spacing(2)}
            marginBottom={theme.spacing(2)}
            textAlign='right'
          >
            {strings.formatString(strings.TARGET_HECTARES_PLANTED, <FormattedNumber value={totalArea || 0} />)}
          </Typography>
          <Link to={APP_PATHS.NURSERY_WITHDRAWALS}>
            <Typography fontSize='16px' fontWeight={500}>
              {strings.formatString(strings.GO_TO, strings.PLANTING_PROGRESS)}
            </Typography>
          </Link>
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%'>
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
          <PlantingSiteDensityCard plantingSiteId={plantingSiteId} />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.OBSERVED_DENSITY_PER_ZONE}
          </Typography>
          <Tooltip title={strings.OBSERVED_DENSITY_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={1}>
          <PlantingDensityPerZoneCard plantingSiteId={plantingSiteId} />
        </Box>
      </Box>
    </Card>
  );
}
