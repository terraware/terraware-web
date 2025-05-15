import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { useProjectPlantings } from 'src/hooks/useProjectPlantings';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import NumberOfSpeciesPlantedCard from './NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from './PlantsReportedPerSpeciesCard';

export default function PlantsAndSpeciesCard({
  plantingSiteId,
  organizationId,
  projectId,
}: {
  plantingSiteId?: number;
  organizationId?: number;
  projectId?: number;
}): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const { plantingSiteReportedPlants } = usePlantingSiteData();
  const { reportedPlants } = useProjectPlantings(projectId, organizationId);
  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '16px',
    marginLeft: '16px',
  };

  const projectTotalSpecies = useMemo(() => {
    const allSpeciesIds = new Set();
    for (const site of reportedPlants) {
      for (const species of site.species) {
        allSpeciesIds.add(species.id);
      }
    }
    return allSpeciesIds.size;
  }, [reportedPlants]);

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
            {plantingSiteId && plantingSiteId !== -1 ? (
              plantingSiteReportedPlants ? (
                <FormattedNumber value={plantingSiteReportedPlants.totalPlants} />
              ) : (
                ''
              )
            ) : (
              reportedPlants.reduce((sum, sitePlants) => sum + sitePlants.totalPlants, 0)
            )}
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
            {plantingSiteId && plantingSiteId !== -1 ? (
              <FormattedNumber value={plantingSiteReportedPlants?.species?.length ?? 0} />
            ) : (
              projectTotalSpecies
            )}
          </Typography>
        </Box>
      </Box>
      <div style={separatorStyles} />
      {(plantingSiteReportedPlants?.totalPlants || projectTotalSpecies) > 0 && (
        <>
          <Box flexBasis='100%'>
            <PlantsReportedPerSpeciesCard newVersion projectId={projectId} organizationId={organizationId} />
          </Box>
          <div style={separatorStyles} />
        </>
      )}
      <Box flexBasis='100%'>
        <NumberOfSpeciesPlantedCard newVersion projectId={projectId} organizationId={organizationId} />
      </Box>
    </Card>
  );
}
