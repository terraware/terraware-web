import React from 'react';

import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import { SiteT0Data } from 'src/types/Tracking';

import ZoneT0Box from './ZoneT0Box';

type TemporaryPlotsTabProps = {
  zonesWithObservations: Record<string, PlotsWithObservationsSearchResult[]>;
  withdrawnSpeciesPlots?: SpeciesPlot[];
  t0SiteData?: SiteT0Data;
};

const TemporaryPlotsTab = ({ zonesWithObservations, withdrawnSpeciesPlots, t0SiteData }: TemporaryPlotsTabProps) => {
  return Object.entries(zonesWithObservations).map(([zoneId, plots]) => {
    const plotIds = plots.map((plot) => plot.id.toString());
    const filteredWithdrawnSpecies = withdrawnSpeciesPlots?.filter((wsp) =>
      plotIds.includes(wsp.monitoringPlotId.toString())
    );
    return (
      <ZoneT0Box
        key={zoneId}
        plotsWithObservations={plots}
        withdrawnSpeciesPlot={filteredWithdrawnSpecies}
        t0Zone={t0SiteData?.zones.find((z) => z.plantingZoneId.toString() === zoneId.toString())}
      />
    );
  });
};

export default TemporaryPlotsTab;
