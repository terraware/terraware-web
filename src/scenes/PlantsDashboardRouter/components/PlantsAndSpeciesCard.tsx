import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { useLocalization } from 'src/providers';
import { selectPlantings, selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import {
  selectMultipleSitesTotalPlants,
  selectSiteReportedPlants,
} from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import { TrackingService } from 'src/services';
import strings from 'src/strings';

import NumberOfSpeciesPlantedCard from './NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from './PlantsReportedPerSpeciesCard';

type PlantsAndSpeciesCardProps = {
  plantingSiteId: number;
  hasReportedPlants: boolean;
  organizationId: number;
  projectId?: number;
};

export default function PlantsAndSpeciesCard({
  plantingSiteId,
  hasReportedPlants,
  organizationId,
  projectId,
}: PlantsAndSpeciesCardProps): JSX.Element {
  const siteReportedPlants = useAppSelector((state) => selectSiteReportedPlants(state, plantingSiteId));
  const theme = useTheme();
  const plantings = useAppSelector((state) => selectPlantingsForSite(state, plantingSiteId));
  const allPlantings = useAppSelector(selectPlantings);
  const [totalSpecies, setTotalSpecies] = useState<number>();
  const { isDesktop } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const [plantingSitesIds, setPlantingSitesIds] = useState<string[]>();
  const projectTotalPlants = useAppSelector((state) => selectMultipleSitesTotalPlants(state, plantingSitesIds ?? []));

  const isRolledUpView = useMemo(() => {
    return plantingSiteId === -2 && projectId;
  }, [plantingSiteId, projectId]);

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await TrackingService.listPlantingSites(organizationId, undefined, activeLocale);
      if (serverResponse.requestSucceeded) {
        const plantingSitesList = projectId
          ? serverResponse.sites?.filter((ps) => ps.projectId === projectId).map((ps) => ps.id.toString())
          : [];

        setPlantingSitesIds(plantingSitesList);
      }
    };
    if (isRolledUpView) {
      void populatePlantingSites();
    }
  }, [plantingSiteId, projectId, organizationId]);

  useEffect(() => {
    const speciesNames: Set<string> = new Set();

    if (isRolledUpView) {
      const projectPlantings = allPlantings?.filter((planting) => plantingSitesIds?.includes(planting.plantingSite.id));
      projectPlantings?.forEach((planting) => {
        const { scientificName } = planting.species;
        speciesNames.add(scientificName);
      });
    } else {
      plantings.forEach((planting) => {
        const { scientificName } = planting.species;
        speciesNames.add(scientificName);
      });
    }

    const speciesCount = speciesNames.size;
    setTotalSpecies(speciesCount);
  }, [plantings, allPlantings, isRolledUpView, plantingSitesIds]);

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
            {<FormattedNumber value={isRolledUpView ? projectTotalPlants : siteReportedPlants?.totalPlants ?? 0} />}
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
            <FormattedNumber value={totalSpecies || 0} />
          </Typography>
        </Box>
      </Box>
      <div style={separatorStyles} />
      {hasReportedPlants && (
        <>
          <Box flexBasis='100%'>
            <PlantsReportedPerSpeciesCard plantingSiteId={plantingSiteId} newVersion />
          </Box>
          <div style={separatorStyles} />
        </>
      )}
      <Box flexBasis='100%'>
        <NumberOfSpeciesPlantedCard plantingSiteId={plantingSiteId} newVersion />
      </Box>
    </Card>
  );
}
