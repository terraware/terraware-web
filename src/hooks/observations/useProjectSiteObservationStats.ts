import { useEffect, useMemo, useState } from 'react';

import { ObservationSiteStatsPayload, useLazyGetSiteObservationStatsQuery } from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

export type ProjectSiteObservationStats = {
  site: PlantingSitePayload;
  stats?: ObservationSiteStatsPayload;
};

type ResolvedProjectStats = {
  projectId: number;
  siteStats: ProjectSiteObservationStats[];
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
  const [getSiteObservationStats] = useLazyGetSiteObservationStatsQuery();
  const [resolved, setResolved] = useState<ResolvedProjectStats>();

  useEffect(() => {
    if (enabled && projectId !== undefined) {
      void listProjectSites({ projectId, full: true, includeZones: false }, true);
    }
  }, [enabled, listProjectSites, projectId]);

  const projectSites = useMemo(
    () => (enabled && projectId !== undefined ? listProjectSitesResponse.currentData?.sites ?? [] : []),
    [enabled, listProjectSitesResponse, projectId]
  );

  useEffect(() => {
    if (!enabled || projectId === undefined) {
      return;
    }

    void Promise.all(
      projectSites.map(async (site) => {
        try {
          const response = await getSiteObservationStats(site.id, true).unwrap();
          return { site, stats: response.stats };
        } catch {
          return { site, stats: undefined };
        }
      })
    ).then((siteStats) => setResolved({ projectId, siteStats }));
  }, [enabled, getSiteObservationStats, projectId, projectSites]);

  return useMemo(
    () => (enabled && resolved !== undefined && resolved.projectId === projectId ? resolved.siteStats : []),
    [enabled, projectId, resolved]
  );
};

export default useProjectSiteObservationStats;
