import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Checkbox, Icon } from '@terraware/web-components';

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
  plantingSiteId: number;
};

export default function PlantingProgressMapDrawer({
  featureId,
  layerId,
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
        showWithdrawalHistory: !!stratumStats?.totalPlants,
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
        showWithdrawalHistory: !!substratumStats?.totalPlants,
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
      .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
  }, [substratum, updateSubstratum, snackbar]);

  if (!view) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column'>
      <Box bgcolor={theme.palette.TwClrBgSecondary} padding={theme.spacing(1, 1, 1, 1)} marginBottom={theme.spacing(1)}>
        <Typography fontSize='16px' fontWeight={600}>
          {view.name}
        </Typography>
      </Box>
      <Box
        bgcolor={
          view.showMarkComplete && substratum?.plantingCompleted ? theme.palette.TwClrBgSuccessTertiary : undefined
        }
        padding={theme.spacing(1, 1)}
      >
        <Box display='flex' justifyContent='space-between' alignItems='baseline'>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.AREA_HA}
          </Typography>
          <Typography fontSize='16px' fontWeight={400}>
            <FormattedNumber decimals={1} value={view.areaHa ?? 0} />
          </Typography>
        </Box>
      </Box>
      {view.showMarkComplete && substratum && (
        <Box padding={theme.spacing(1, 1)}>
          <Checkbox
            id='planting-complete-checkbox'
            name='plantingComplete'
            value={substratum.plantingCompleted}
            onChange={() => completeUpdate()}
            disabled={updateSubstratumResponse.isLoading}
            label={
              <Box display='flex' alignItems='center' gap={1}>
                <Typography fontSize='16px' fontWeight={400}>
                  {strings.SET_PLANTING_COMPLETE}
                </Typography>
                <Tooltip title={strings.PLANTING_COMPLETE_CHECKBOX_TOOLTIP}>
                  <Box display='flex' alignItems='center'>
                    <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                  </Box>
                </Tooltip>
              </Box>
            }
          />
        </Box>
      )}
      <Box
        bgcolor={theme.palette.TwClrBgSecondary}
        display='flex'
        justifyContent='space-between'
        alignItems='baseline'
        marginTop={theme.spacing(1)}
        padding={theme.spacing(1, 1)}
      >
        <Typography fontSize='14px' fontWeight={600}>
          {strings.SEEDLINGS_WITHDRAWN_FOR_PLANTING}
        </Typography>
        <Typography fontSize='16px' fontWeight={600}>
          <FormattedNumber value={view.totalPlants} />
        </Typography>
      </Box>
      {view.speciesList.length > 0 && (
        <Box marginTop={theme.spacing(1)} padding={theme.spacing(0, 1)}>
          {view.speciesList.map((reportedSpecies) => (
            <Box
              key={reportedSpecies.id}
              display='flex'
              justifyContent='space-between'
              alignItems='baseline'
              padding={theme.spacing(1, 0)}
            >
              <Typography fontSize='16px' fontWeight={400}>
                {getSpeciesName(reportedSpecies.id)}
              </Typography>
              <Typography fontSize='16px' fontWeight={400}>
                <FormattedNumber value={reportedSpecies.totalPlants} />
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      {view.showWithdrawalHistory && withdrawalHistoryUrl && (
        <Link
          to={withdrawalHistoryUrl}
          style={{
            textAlign: 'left',
            fontSize: '16px',
            fontWeight: 400,
            marginTop: theme.spacing(1),
            padding: theme.spacing(0, 1),
          }}
        >
          {strings.SEE_WITHDRAWAL_HISTORY}
        </Link>
      )}
    </Box>
  );
}
