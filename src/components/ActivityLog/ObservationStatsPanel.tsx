import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useLocalization } from 'src/providers/hooks';

type ObservationStatsPanelProps = {
  livePlants: number | null | undefined;
  plantDensity: number | undefined;
  survivalRate: number | undefined;
  valueColor?: string;
};

export default function ObservationStatsPanel({
  livePlants,
  plantDensity,
  survivalRate,
  valueColor,
}: ObservationStatsPanelProps): JSX.Element {
  const { strings } = useLocalization();

  return (
    <>
      <Grid item xs={12} sm={4}>
        <OverviewItemCard
          isEditable={false}
          title={strings.LIVE_PLANTS}
          contents={(livePlants ?? 0).toString()}
          sx={{ padding: 0 }}
          valueColor={valueColor}
        />
      </Grid>
      {!!plantDensity && (
        <Grid item xs={12} sm={4}>
          <OverviewItemCard
            isEditable={false}
            title={strings.PLANT_DENSITY}
            contents={plantDensity.toString()}
            sx={{ padding: 0 }}
            valueColor={valueColor}
          />
        </Grid>
      )}
      {survivalRate !== undefined && (
        <Grid item xs={12} sm={4}>
          <OverviewItemCard
            isEditable={false}
            title={strings.SURVIVAL_RATE}
            contents={`${survivalRate}%`}
            sx={{ padding: 0 }}
            valueColor={valueColor}
          />
        </Grid>
      )}
    </>
  );
}
