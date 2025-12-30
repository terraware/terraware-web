import React, { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { useProjectPlantings } from 'src/hooks/useProjectPlantings';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import NumberOfSpeciesPlantedCard from './NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from './PlantsReportedPerSpeciesCard';

export default function PlantsAndSpeciesCard({ projectId }: { projectId?: number }): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const { plantingSiteReportedPlants } = usePlantingSiteData();
  const { plantingSite, allPlantingSites } = usePlantingSiteData();
  const { reportedPlants } = useProjectPlantings(projectId);
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
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

  useEffect(() => {
    setPlantingSites(allPlantingSites?.filter((ps) => ps.projectId === projectId));
  }, [allPlantingSites, projectId]);

  const totalAreaRolledUp = useMemo(() => {
    return plantingSites?.reduce((sum, site) => sum + (site?.areaHa ?? 0), 0) || 0;
  }, [plantingSites]);

  const totalArea = useMemo(() => {
    return plantingSite && plantingSite?.id === -1 ? totalAreaRolledUp : plantingSite?.areaHa ?? 0;
  }, [plantingSite, totalAreaRolledUp]);

  const calculatePlantingSitePlantedArea = (iPlantingSite: PlantingSite) => {
    return (
      iPlantingSite?.strata
        ?.flatMap((zone) => zone.substrata)
        ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0
    );
  };

  const projectTotalPlanted =
    plantingSites?.reduce((total, pPlantingSite) => {
      return total + calculatePlantingSitePlantedArea(pPlantingSite);
    }, 0) || 0;

  const totalPlantedArea = useMemo(() => {
    if (plantingSite && plantingSite.id !== -1) {
      return calculatePlantingSitePlantedArea(plantingSite);
    }
    if (plantingSite?.id === -1) {
      return projectTotalPlanted;
    }
    return 0;
  }, [plantingSite, projectTotalPlanted]);

  const percentagePlanted = useMemo(() => {
    return totalArea > 0 ? Math.round(((totalPlantedArea || 0) / totalArea) * 100) : 0;
  }, [totalPlantedArea, totalArea]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={isDesktop ? 4 : 12}>
        <Card radius='8px'>
          <Box flexBasis='100%'>
            <Box display={'flex'} alignItems={'center'}>
              <Typography fontSize='24px' fontWeight={600} paddingRight={1}>
                {strings.formatString(strings.X_HA, <FormattedNumber value={Math.round(totalPlantedArea * 10) / 10} />)}
              </Typography>
              <Tooltip
                title={
                  plantingSite?.id === -1
                    ? strings.PLANTING_COMPLETE_ROLLED_UP_DASHBOARD_TOOLTIP
                    : strings.PLANTING_COMPLETE_DASHBOARD_TOOLTIP
                }
              >
                <Box display='flex'>
                  <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                </Box>
              </Tooltip>
            </Box>
            <Box display='flex' justifyContent={'space-between'} maxWidth={'440px'}>
              <Typography fontSize={'16px'} fontWeight={600} marginRight={1}>
                {strings.TOTAL_PLANTED_COMPLETE}
              </Typography>
              <Typography
                fontSize='14px'
                fontWeight={400}
                marginTop={1}
                textAlign='right'
                color={theme.palette.TwClrTxtSecondary}
              >
                {strings.formatString(strings.TARGET_HECTARES_PLANTED, <FormattedNumber value={totalArea || 0} />)}
              </Typography>
            </Box>
            <Box marginTop={1}>
              <Box display='flex' alignItems={'center'}>
                <Typography fontSize='14px' fontWeight={500} maxWidth={'190px'}>
                  {strings.PLANTING_COMPLETE_CHART}: {percentagePlanted}%
                </Typography>
                <Box width={'280px'} marginLeft={1}>
                  <ProgressChart value={totalPlantedArea || 0} target={totalArea} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={isDesktop ? 4 : 12}>
        <Card radius='8px' style={{ height: '100%' }}>
          <Box flexBasis='100%'>
            <Box display={'flex'} alignItems={'center'}>
              <Typography fontSize={'24px'} fontWeight={600} paddingRight={1}>
                {plantingSite && plantingSite?.id !== -1 ? (
                  plantingSiteReportedPlants ? (
                    <FormattedNumber value={plantingSiteReportedPlants.totalPlants} />
                  ) : (
                    ''
                  )
                ) : (
                  <FormattedNumber
                    value={reportedPlants.reduce((sum, sitePlants) => sum + sitePlants.totalPlants, 0)}
                  />
                )}{' '}
                {strings.PLANTS}
              </Typography>
              <Tooltip
                title={
                  plantingSite?.id === -1
                    ? strings.TOTAL_PLANTS_PLANTED_ROLLED_UP_TOOLTIP
                    : strings.TOTAL_PLANTS_PLANTED_TOOLTIP
                }
              >
                <Box display='flex'>
                  <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                </Box>
              </Tooltip>
            </Box>
            <Typography fontSize={'16px'} fontWeight={600} marginRight={1}>
              {strings.TOTAL_PLANTED}
            </Typography>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={isDesktop ? 4 : 12}>
        <Card radius='8px' style={{ height: '100%' }}>
          <Box>
            <Box display={'flex'} alignItems={'center'}>
              <Typography fontSize={'24px'} fontWeight={600} paddingRight={1}>
                {plantingSite && plantingSite?.id !== -1 ? (
                  <FormattedNumber value={plantingSiteReportedPlants?.species?.length ?? 0} />
                ) : (
                  <FormattedNumber value={projectTotalSpecies} />
                )}{' '}
                {strings.SPECIES}
              </Typography>
              <Tooltip
                title={
                  plantingSite?.id === -1
                    ? strings.TOTAL_SPECIES_PLANTED_ROLLED_UP_TOOLTIP
                    : strings.TOTAL_SPECIES_PLANTED_TOOLTIP
                }
              >
                <Box display='flex'>
                  <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                </Box>
              </Tooltip>
            </Box>

            <Typography fontSize={'16px'} fontWeight={600} marginRight={1}>
              {strings.TOTAL_PLANTED}
            </Typography>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card radius='8px' style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column' }}>
          <Box flexBasis='100%'>
            <PlantsReportedPerSpeciesCard newVersion projectId={projectId} />
          </Box>
          <div style={separatorStyles} />
          <Box flexBasis='100%'>
            <NumberOfSpeciesPlantedCard projectId={projectId} />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
