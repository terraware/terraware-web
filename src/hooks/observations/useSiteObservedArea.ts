import { useMemo } from 'react';

import { MONITORING_PLOT_SIZE, SQ_M_TO_HECTARES } from 'src/constants';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';

/**
 * Observed area (hectares) for a planting site: the total number of plots observed in each
 * substratum's latest observation, multiplied by the (fixed) monitoring plot area.
 */
const useSiteObservedArea = (plantingSite: PlantingSitePayload | undefined): number =>
  useMemo(() => {
    const totalPlots = (plantingSite?.strata ?? [])
      .flatMap((stratum) => stratum.substrata)
      .reduce((sum, substratum) => sum + (substratum.latestObservationNumPlots ?? 0), 0);

    return totalPlots * MONITORING_PLOT_SIZE * MONITORING_PLOT_SIZE * SQ_M_TO_HECTARES;
  }, [plantingSite]);

export default useSiteObservedArea;
