import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import NumberOfSpeciesPlantedCard from './NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from './PlantsReportedPerSpeciesCard';

export default function PlantsAndSpeciesCard(): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const { plantingSiteReportedPlants } = usePlantingSiteData();
  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '16px',
    marginLeft: '16px',
  };

  return (
    <Card radius='8px' style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column' }}>
      <Box flexBasis='100%'>
        <Box>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.TOTAL_PLANTS_PLANTED}
            </Typography>
            <Tooltip title={strings.TOTAL_PLANTS_PLANTED_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Typography fontSize={'48px'} fontWeight={600} marginTop={1}>
            {plantingSiteReportedPlants && <FormattedNumber value={plantingSiteReportedPlants.totalPlants} />}
          </Typography>
        </Box>
        <Box marginTop={3}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.TOTAL_SPECIES_PLANTED}
            </Typography>
            <Tooltip title={strings.TOTAL_SPECIES_PLANTED_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Typography fontSize={'48px'} fontWeight={600} marginTop={1}>
            <FormattedNumber value={plantingSiteReportedPlants?.species?.length ?? 0} />
          </Typography>
        </Box>
      </Box>
      <div style={separatorStyles} />
      {(plantingSiteReportedPlants?.totalPlants || 0) > 0 && (
        <>
          <Box flexBasis='100%'>
            <PlantsReportedPerSpeciesCard newVersion />
          </Box>
          <div style={separatorStyles} />
        </>
      )}
      <Box flexBasis='100%'>
        <NumberOfSpeciesPlantedCard newVersion />
      </Box>
    </Card>
  );
}
