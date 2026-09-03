import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { PlantingSitePayload, useListPlantingSiteSpeciesTargetsQuery } from 'src/queries/generated/plantingSites';
import PlantingSiteMapV2 from 'src/scenes/PlantingSitesRouter/view/PlantingSiteMapV2';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanStats from './PlantingPlanStats';
import { siteGoalPlants } from './plantingPlanGoals';

const PLACEHOLDER = '-';

type PlantingPlanOverviewProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanOverview = ({ plantingSite }: PlantingPlanOverviewProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { data: speciesTargetsData } = useListPlantingSiteSpeciesTargetsQuery(plantingSite.id);

  const stats = useMemo(() => {
    const plantsValue = (plants: number | undefined) =>
      plants === undefined
        ? strings.NO_PLANTS_SET
        : strings.formatString(strings.X_PLANTS, numberFormatter.format(plants)).toString();

    const targets = speciesTargetsData?.targets;
    const speciesValue =
      targets === undefined
        ? strings.formatString(strings.X_SPECIES, PLACEHOLDER).toString()
        : targets.length === 0
          ? strings.NO_SPECIES_SET
          : strings.formatString(strings.X_SPECIES, numberFormatter.format(targets.length)).toString();

    return {
      initialGoal: plantsValue(siteGoalPlants(plantingSite, 'initial')),
      targetGoal: plantsValue(siteGoalPlants(plantingSite, 'target')),
      species: speciesValue,
    };
  }, [numberFormatter, plantingSite, speciesTargetsData]);

  return (
    <Card
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(3), width: '100%' }}
      radius={theme.spacing(1)}
    >
      <PlantingPlanStats initialGoal={stats.initialGoal} targetGoal={stats.targetGoal} species={stats.species} />

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
        {plantingSite.boundary && plantingSite.strata && <PlantingSiteMapV2 plantingSiteId={plantingSite.id} />}
      </Box>
    </Card>
  );
};

export default PlantingPlanOverview;
