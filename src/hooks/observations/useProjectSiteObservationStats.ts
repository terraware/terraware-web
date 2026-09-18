import { useEffect, useMemo } from 'react';

import { ObservationSiteStatsPayload, useLazyGetObservationStatsQuery } from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

export type ProjectSiteObservationStats = {
  site: PlantingSitePayload;
  stats?: ObservationSiteStatsPayload;
};

/**
 * Every planting site in a project paired with its latest observation statistics. Sites are
 * requested with their strata so callers can resolve stratum names. Returns an empty array until
 * both fetches resolve, and skips entirely when disabled.
 */
const useProjectSiteObservationStats = (
  projectId: number | undefined,
  enabled = true
): ProjectSiteObservationStats[] => {
  const [listProjectSites, listProjectSitesResponse] = useLazyListPlantingSitesQuery();
  const [getObservationStats, statsResponse] = useLazyGetObservationStatsQuery();

  useEffect(() => {
    if (enabled && projectId !== undefined) {
      void listProjectSites({ projectId, full: true, includeZones: false }, true);
      void getObservationStats({ projectId }, true);
    }
  }, [enabled, getObservationStats, listProjectSites, projectId]);

  const projectSites = useMemo(
    () => (enabled && projectId !== undefined ? listProjectSitesResponse.currentData?.sites ?? [] : []),
    [enabled, listProjectSitesResponse, projectId]
  );

  const statsBySiteId = useMemo(
    () => new Map((statsResponse.currentData?.stats ?? []).map((siteStats) => [siteStats.plantingSiteId, siteStats])),
    [statsResponse.currentData]
  );

  return useMemo(
    () => projectSites.map((site) => ({ site, stats: statsBySiteId.get(site.id) })),
    [projectSites, statsBySiteId]
  );
};

export default useProjectSiteObservationStats;
