import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import FormattedNumber from 'src/components/common/FormattedNumber';
import usePlantingSiteReportedPlants from 'src/hooks/usePlantingSiteReportedPlants';
import { useLocalization } from 'src/providers';
import {
  useLazyGetPlantingSiteQuery,
  useLazyListPlantingSiteReportedPlantsQuery,
  useLazyListPlantingSitesQuery,
} from 'src/queries/generated/plantingSites';
import { PlantingSite } from 'src/types/Tracking';

import NumberOfSpeciesPlantedCard from './NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from './PlantsReportedPerSpeciesCard';

export default function PlantsAndSpeciesCard({
  plantingSiteId,
  projectId,
}: {
  plantingSiteId?: number;
  projectId?: number;
}): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { isDesktop } = useDeviceInfo();

  const { plantingSiteReportedPlants } = usePlantingSiteReportedPlants(plantingSiteId);

  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const [listPlantingSiteReportedPlants, listPlantingSiteReportedPlantsResponse] =
    useLazyListPlantingSiteReportedPlantsQuery();

  useEffect(() => {
    if (plantingSiteId) {
      void getPlantingSite({ id: plantingSiteId, includeZones: false }, true);
    } else if (projectId) {
      void listPlantingSites({ projectId, full: true, includeZones: false }, true);
      void listPlantingSiteReportedPlants({ projectId }, true);
    }
  }, [getPlantingSite, listPlantingSiteReportedPlants, listPlantingSites, plantingSiteId, projectId]);

  const plantingSite = useMemo(() => getPlantingSiteResponse.currentData?.site, [getPlantingSiteResponse]);

  const projectPlantingSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse]
  );

  const projectReportedPlants = useMemo(
    () => listPlantingSiteReportedPlantsResponse.currentData?.sites ?? [],
    [listPlantingSiteReportedPlantsResponse]
  );

  const projectTotalSpecies = useMemo(() => {
    const allSpeciesIds = new Set();
    for (const site of projectReportedPlants) {
      for (const species of site.species) {
        allSpeciesIds.add(species.id);
      }
    }
    return allSpeciesIds.size;
  }, [projectReportedPlants]);

  const totalAreaRolledUp = useMemo(() => {
    return projectPlantingSites?.reduce((sum, site) => sum + (site?.areaHa ?? 0), 0) ?? 0;
  }, [projectPlantingSites]);

  const totalArea = useMemo(() => {
    if (projectId && plantingSiteId === undefined) {
      return totalAreaRolledUp;
    } else {
      return plantingSite?.areaHa ?? 0;
    }
  }, [plantingSite, plantingSiteId, projectId, totalAreaRolledUp]);

  const calculatePlantingSitePlantedArea = (site: PlantingSite) => {
    return (
      site?.strata
        ?.flatMap((stratum) => stratum.substrata)
        ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0
    );
  };

  const projectTotalPlanted =
    projectPlantingSites?.reduce((total, site) => {
      return total + calculatePlantingSitePlantedArea(site);
    }, 0) || 0;

  const totalPlantedArea = useMemo(() => {
    if (projectId && plantingSiteId === undefined) {
      return projectTotalPlanted;
    } else if (plantingSiteId && plantingSite) {
      return calculatePlantingSitePlantedArea(plantingSite);
    } else {
      return 0;
    }
  }, [plantingSite, plantingSiteId, projectId, projectTotalPlanted]);

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
                  plantingSiteId
                    ? strings.PLANTING_COMPLETE_DASHBOARD_TOOLTIP
                    : strings.PLANTING_COMPLETE_ROLLED_UP_DASHBOARD_TOOLTIP
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
                {projectId && plantingSiteId === undefined ? (
                  <FormattedNumber
                    value={projectReportedPlants.reduce((sum, sitePlants) => sum + sitePlants.totalPlants, 0)}
                  />
                ) : (
                  <FormattedNumber value={plantingSiteReportedPlants?.totalPlants ?? 0} />
                )}{' '}
                {strings.PLANTS}
              </Typography>
              <Tooltip
                title={
                  plantingSiteId ? strings.TOTAL_PLANTS_PLANTED_TOOLTIP : strings.TOTAL_PLANTS_PLANTED_ROLLED_UP_TOOLTIP
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
                {projectId && plantingSiteId === undefined ? (
                  <FormattedNumber value={projectTotalSpecies} />
                ) : (
                  <FormattedNumber value={plantingSiteReportedPlants?.species?.length ?? 0} />
                )}{' '}
                {strings.SPECIES}
              </Typography>
              <Tooltip
                title={
                  plantingSiteId
                    ? strings.TOTAL_SPECIES_PLANTED_TOOLTIP
                    : strings.TOTAL_SPECIES_PLANTED_ROLLED_UP_TOOLTIP
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
            <PlantsReportedPerSpeciesCard newVersion plantingSiteId={plantingSiteId} projectId={projectId} />
          </Box>
          <div
            style={{
              width: '1px',
              height: 'auto',
              backgroundColor: theme.palette.TwClrBrdrTertiary,
              marginRight: '16px',
              marginLeft: '16px',
            }}
          />
          <Box flexBasis='100%'>
            <NumberOfSpeciesPlantedCard plantingSiteId={plantingSiteId} projectId={projectId} />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
