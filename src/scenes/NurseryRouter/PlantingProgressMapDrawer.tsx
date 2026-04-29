import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useGetPlantingSiteQuery, useGetPlantingSiteReportedPlantsQuery } from 'src/queries/generated/plantingSites';
import { useUpdateSubstrataMutation } from 'src/queries/generated/substrata';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

type PlantingProgressMapDrawerProps = {
  featureId: string;
  layerId: 'sites' | 'strata' | 'substrata';
  onComplete?: () => void;
  plantingSiteId: number;
};

export default function PlantingProgressMapDrawer({
  featureId,
  layerId,
  onComplete,
  plantingSiteId,
}: PlantingProgressMapDrawerProps): JSX.Element | null {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { species } = useSpeciesData();

  const plantingSiteResponse = useGetPlantingSiteQuery({ id: plantingSiteId });
  const plantingSite = plantingSiteResponse.currentData?.site;

  const reportedPlantsResponse = useGetPlantingSiteReportedPlantsQuery(plantingSiteId);
  const reportedPlants = reportedPlantsResponse.currentData?.site;

  const [updateSubstratum, updateSubstratumResponse] = useUpdateSubstrataMutation();

  const getSpeciesName = useCallback(
    (speciesId: number) => species.find((s) => s.id === speciesId)?.scientificName ?? '',
    [species]
  );

  const stratum = useMemo(() => {
    if (layerId === 'strata') {
      return plantingSite?.strata?.find((s) => `${s.id}` === featureId);
    }
    if (layerId === 'substrata') {
      return plantingSite?.strata?.find((s) => s.substrata.some((sub) => `${sub.id}` === featureId));
    }
    return undefined;
  }, [layerId, featureId, plantingSite]);

  const substratum = useMemo(() => {
    if (layerId !== 'substrata') {
      return undefined;
    }
    return stratum?.substrata.find((sub) => `${sub.id}` === featureId);
  }, [layerId, featureId, stratum]);

  const view = useMemo(() => {
    if (layerId === 'sites' && plantingSite) {
      const reported = reportedPlants;
      return {
        name: plantingSite.name,
        areaHa: plantingSite.areaHa,
        totalPlants: reported?.totalPlants ?? 0,
        speciesList: reported?.species ?? [],
        substratumNamesForFilter: undefined as string[] | undefined,
        showWithdrawalHistory: false,
        showMarkComplete: false,
      };
    }
    if (layerId === 'strata' && stratum) {
      const stratumStats = reportedPlants?.strata.find((s) => s.id === stratum.id);
      const substratumNames = stratum.substrata.map((sub) => sub.name).filter((name): name is string => Boolean(name));
      return {
        name: stratum.name,
        areaHa: stratum.areaHa,
        totalPlants: stratumStats?.totalPlants ?? 0,
        speciesList: stratumStats?.species ?? [],
        substratumNamesForFilter: substratumNames,
        showWithdrawalHistory: true,
        showMarkComplete: false,
      };
    }
    if (layerId === 'substrata' && substratum) {
      const substratumStats = reportedPlants?.strata.flatMap((s) => s.substrata).find((s) => s.id === substratum.id);
      const substratumName = substratum.name;
      return {
        name: substratum.name,
        areaHa: substratum.areaHa,
        totalPlants: substratumStats?.totalPlants ?? 0,
        speciesList: substratumStats?.species ?? [],
        substratumNamesForFilter: [substratumName],
        showWithdrawalHistory: true,
        showMarkComplete: true,
      };
    }
    return undefined;
  }, [layerId, plantingSite, reportedPlants, stratum, substratum]);

  const withdrawalHistoryUrl = useMemo(() => {
    if (!view?.substratumNamesForFilter) {
      return undefined;
    }
    const params = new URLSearchParams({ tab: 'withdrawal_history' });
    view.substratumNamesForFilter.forEach((name) => params.append('substratumName', name));
    return `${APP_PATHS.NURSERY_WITHDRAWALS}?${params.toString()}`;
  }, [view]);

  const completeUpdate = useCallback(() => {
    if (!substratum) {
      return;
    }
    updateSubstratum({
      id: substratum.id,
      updateSubstratumRequestPayload: { plantingCompleted: !substratum.plantingCompleted },
    })
      .unwrap()
      .then(() => onComplete?.())
      .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
  }, [substratum, updateSubstratum, onComplete, snackbar]);

  if (!view) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column' padding={theme.spacing(3)}>
      <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(2)}>
        {view.name}
      </Typography>
      <Typography fontSize='16px' fontWeight={400}>
        {strings.AREA_HA}
        {': '}
        <FormattedNumber decimals={1} value={view.areaHa ?? 0} />
      </Typography>
      <Typography fontSize='16px' fontWeight={400} marginTop={theme.spacing(1)}>
        <FormattedNumber value={view.totalPlants} />
        &nbsp;{strings.SEEDLINGS_SENT}
      </Typography>
      {view.speciesList.length > 0 && (
        <ul style={{ margin: theme.spacing(1, 0, 0, 0), paddingLeft: theme.spacing(3) }}>
          {view.speciesList.map((reportedSpecies) => (
            <li key={reportedSpecies.id}>
              <Typography fontSize='16px' fontWeight={400}>
                <FormattedNumber value={reportedSpecies.totalPlants} />
                &nbsp;{getSpeciesName(reportedSpecies.id)}
              </Typography>
            </li>
          ))}
        </ul>
      )}
      {view.showWithdrawalHistory && withdrawalHistoryUrl && (
        <Link
          to={withdrawalHistoryUrl}
          style={{
            textAlign: 'left',
            fontSize: '16px',
            fontWeight: 400,
            marginTop: theme.spacing(3),
          }}
        >
          {strings.SEE_WITHDRAWAL_HISTORY}
        </Link>
      )}
      {view.showMarkComplete && substratum && (
        <Box display='flex' justifyContent='flex-end' marginTop={theme.spacing(3)}>
          <Button
            onClick={completeUpdate}
            label={substratum.plantingCompleted ? strings.UNDO_PLANTING_COMPLETE : strings.SET_PLANTING_COMPLETE}
            type={substratum.plantingCompleted ? 'passive' : 'productive'}
            disabled={updateSubstratumResponse.isLoading}
          />
        </Box>
      )}
    </Box>
  );
}
