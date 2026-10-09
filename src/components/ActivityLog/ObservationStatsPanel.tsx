import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import PendingSurvivalRate from 'src/components/SurvivalRate/PendingSurvivalRate';
import { useLocalization } from 'src/providers/hooks';

import ActivityStatField from './ActivityStatField';

type ObservationStatsPanelProps = {
  isEditing?: boolean;
  livePlants: number | null | undefined;
  plantDensity: number | undefined;
  survivalRate: number | undefined;
  survivalRatePending?: boolean;
};

export default function ObservationStatsPanel({
  isEditing,
  livePlants,
  plantDensity,
  survivalRate,
  survivalRatePending,
}: ObservationStatsPanelProps): JSX.Element {
  const { strings } = useLocalization();

  return (
    <>
      {typeof livePlants === 'number' && (
        <Grid item xs={12} sm={4}>
          <ActivityStatField
            title={strings.LIVE_PLANTS}
            contents={(livePlants ?? 0).toString()}
            isEditing={isEditing}
          />
        </Grid>
      )}
      {typeof plantDensity === 'number' && (
        <Grid item xs={12} sm={4}>
          <ActivityStatField title={strings.PLANT_DENSITY} contents={plantDensity.toString()} isEditing={isEditing} />
        </Grid>
      )}
      {typeof survivalRate === 'number' && (
        <Grid item xs={12} sm={4}>
          <ActivityStatField
            title={strings.SURVIVAL_RATE}
            contents={<PendingSurvivalRate pending={survivalRatePending}>{`${survivalRate}%`}</PendingSurvivalRate>}
            isEditing={isEditing}
          />
        </Grid>
      )}
    </>
  );
}
