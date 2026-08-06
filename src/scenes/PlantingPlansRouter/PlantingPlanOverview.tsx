import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import PlantingSiteMapV2 from 'src/scenes/PlantingSitesRouter/view/PlantingSiteMapV2';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanStats from './PlantingPlanStats';

const PLACEHOLDER = '-';

export type PlantingPlanOverviewProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanOverview = ({ plantingSite }: PlantingPlanOverviewProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();

  const area = useMemo(
    () =>
      plantingSite.areaHa === undefined
        ? PLACEHOLDER
        : strings.formatString(strings.X_HA, numberFormatter.format(plantingSite.areaHa, { decimals: 1 })).toString(),
    [numberFormatter, plantingSite.areaHa]
  );

  const strataCount = useMemo(
    () => numberFormatter.format(plantingSite.strata?.length ?? 0),
    [numberFormatter, plantingSite.strata]
  );

  return (
    <Card
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(3), width: '100%' }}
      radius={theme.spacing(1)}
    >
      <PlantingPlanStats
        targetPlants={PLACEHOLDER}
        area={area}
        initialPlantingDensity={PLACEHOLDER}
        targetSpecies={PLACEHOLDER}
        strata={strataCount}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
        {plantingSite.boundary && plantingSite.strata && <PlantingSiteMapV2 plantingSiteId={plantingSite.id} />}
      </Box>
    </Card>
  );
};

export default PlantingPlanOverview;
