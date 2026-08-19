import React, { type JSX, useCallback, useEffect, useMemo, useRef } from 'react';

import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import {
  PlantingSitePayload,
  StratumResponsePayload,
  useListPlantingSiteSpeciesTargetsQuery,
} from 'src/queries/generated/plantingSites';
import { useUpdateStratumMutation } from 'src/queries/generated/strata';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import PlantingPlanDensityTable, { CommitStratumDensity } from './PlantingPlanDensityTable';
import PlantingPlanSpeciesSection from './PlantingPlanSpeciesSection';
import PlantingPlanStats from './PlantingPlanStats';
import { siteGoalPlants } from './plantingPlanGoals';

type StratumDensities = { initialPlantingDensity: number; targetPlantDensity?: number };

const PLACEHOLDER = '-';

export type PlantingPlanSiteGoalsProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanSiteGoals = ({ plantingSite }: PlantingPlanSiteGoalsProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const snackbar = useSnackbar();
  const { data: speciesTargetsData } = useListPlantingSiteSpeciesTargetsQuery(plantingSite.id);
  const [updateStratum] = useUpdateStratumMutation();

  const speciesCount = speciesTargetsData?.targets.length ?? 0;

  const strata = useMemo(() => plantingSite.strata ?? [], [plantingSite.strata]);
  const stratumById = useMemo(() => {
    const map: Record<number, StratumResponsePayload> = {};
    strata.forEach((stratum) => {
      map[stratum.id] = stratum;
    });
    return map;
  }, [strata]);

  const submittedRef = useRef<Record<number, StratumDensities>>({});
  const densitySignature = useMemo(
    () => strata.map((s) => `${s.id}:${s.initialPlantingDensity}:${s.targetPlantDensity ?? ''}`).join(','),
    [strata]
  );
  useEffect(() => {
    submittedRef.current = {};
  }, [densitySignature]);

  const commitDensity = useCallback<CommitStratumDensity>(
    async (stratumId, densityType, value) => {
      const stratum = stratumById[stratumId];
      if (!stratum) {
        return;
      }
      const base: StratumDensities = submittedRef.current[stratumId] ?? {
        initialPlantingDensity: stratum.initialPlantingDensity,
        targetPlantDensity: stratum.targetPlantDensity,
      };
      const next: StratumDensities =
        densityType === 'initial'
          ? { initialPlantingDensity: value as number, targetPlantDensity: base.targetPlantDensity }
          : { initialPlantingDensity: base.initialPlantingDensity, targetPlantDensity: value };
      submittedRef.current[stratumId] = next;
      try {
        await updateStratum({ id: stratumId, updateStratumRequestPayload: next }).unwrap();
      } catch (e) {
        submittedRef.current[stratumId] = base;
        snackbar.toastError();
      }
    },
    [stratumById, updateStratum, snackbar]
  );

  const stats = useMemo(() => {
    const plantsValue = (plants: number | undefined) =>
      strings
        .formatString(strings.X_PLANTS, plants === undefined ? PLACEHOLDER : numberFormatter.format(plants))
        .toString();

    return {
      initialGoal: plantsValue(siteGoalPlants(plantingSite, 'initial')),
      targetGoal: plantsValue(siteGoalPlants(plantingSite, 'target')),
      species: strings
        .formatString(strings.X_SPECIES, speciesCount === 0 ? PLACEHOLDER : numberFormatter.format(speciesCount))
        .toString(),
    };
  }, [numberFormatter, plantingSite, speciesCount]);

  return (
    <Card
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(3), width: '100%' }}
      radius={theme.spacing(1)}
    >
      <PlantingPlanStats initialGoal={stats.initialGoal} targetGoal={stats.targetGoal} species={stats.species} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider orientation='vertical' flexItem sx={{ borderColor: theme.palette.TwClrBrdrTertiary }} />}
        spacing={3}
        marginTop={theme.spacing(3)}
      >
        <Box flex={1} minWidth={0}>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginBottom={theme.spacing(2)}>
            {strings.SET_INITIAL_DENSITY_DESCRIPTION}
          </Typography>
          <Box display='flex' flexDirection='column' gap={theme.spacing(3)}>
            <PlantingPlanDensityTable
              plantingSite={plantingSite}
              densityType='initial'
              title={strings.INITIAL_PLANTING_DENSITY}
              onCommitDensity={commitDensity}
            />
            <PlantingPlanDensityTable
              plantingSite={plantingSite}
              densityType='target'
              title={strings.TARGET_PLANT_DENSITY}
              onCommitDensity={commitDensity}
            />
          </Box>
        </Box>

        <PlantingPlanSpeciesSection plantingSite={plantingSite} />
      </Stack>
    </Card>
  );
};

export default PlantingPlanSiteGoals;
