import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { PlantingSitePayload, useListPlantingSiteSpeciesTargetsQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanDensityTable from './PlantingPlanDensityTable';
import PlantingPlanSpeciesSection from './PlantingPlanSpeciesSection';
import PlantingPlanStats from './PlantingPlanStats';
import { siteGoalPlants } from './plantingPlanGoals';

const PLACEHOLDER = '-';

export type PlantingPlanSiteGoalsProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanSiteGoals = ({ plantingSite }: PlantingPlanSiteGoalsProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { data: speciesTargetsData } = useListPlantingSiteSpeciesTargetsQuery(plantingSite.id);

  const speciesCount = speciesTargetsData?.targets.length ?? 0;

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
            />
            <PlantingPlanDensityTable
              plantingSite={plantingSite}
              densityType='target'
              title={strings.TARGET_PLANT_DENSITY}
            />
          </Box>
        </Box>

        <PlantingPlanSpeciesSection plantingSite={plantingSite} />
      </Stack>
    </Card>
  );
};

export default PlantingPlanSiteGoals;
