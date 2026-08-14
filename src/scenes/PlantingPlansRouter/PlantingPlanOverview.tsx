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

export type PlantingPlanOverviewProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanOverview = ({ plantingSite }: PlantingPlanOverviewProps): JSX.Element => {
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

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
        {plantingSite.boundary && plantingSite.strata && <PlantingSiteMapV2 plantingSiteId={plantingSite.id} />}
      </Box>
    </Card>
  );
};

export default PlantingPlanOverview;
