import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import { useLocalization } from 'src/providers/hooks';

import ActivityStatField from './ActivityStatField';

type ObservationStatsPanelProps = {
  isEditing?: boolean;
  livePlants: number | null | undefined;
  plantDensity: number | undefined;
  survivalRate: number | undefined;
};

export default function ObservationStatsPanel({
  isEditing,
  livePlants,
  plantDensity,
  survivalRate,
}: ObservationStatsPanelProps): JSX.Element {
  const { strings } = useLocalization();

  return (
    <>
      <Grid item xs={12} sm={4}>
        <ActivityStatField title={strings.LIVE_PLANTS} contents={(livePlants ?? 0).toString()} isEditing={isEditing} />
      </Grid>
      {!!plantDensity && (
        <Grid item xs={12} sm={4}>
          <ActivityStatField title={strings.PLANT_DENSITY} contents={plantDensity.toString()} isEditing={isEditing} />
        </Grid>
      )}
      {survivalRate !== undefined && (
        <Grid item xs={12} sm={4}>
          <ActivityStatField title={strings.SURVIVAL_RATE} contents={`${survivalRate}%`} isEditing={isEditing} />
        </Grid>
      )}
    </>
  );
}
