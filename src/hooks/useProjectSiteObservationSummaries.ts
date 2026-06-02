import { useEffect, useMemo, useState } from 'react';

import {
  PlantingSiteObservationSummaryPayload,
  useLazyListObservationSummariesQuery,
} from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

export type ProjectSiteObservationSummary = {
  site: PlantingSitePayload;
  summary?: PlantingSiteObservationSummaryPayload;
};

/**
 * Fetches every planting site in a project and the latest observation summary for each.
 * Returns an empty array until both fetches resolve. Skips entirely when `enabled` is false
 * or `projectId` is undefined.
 */
const useProjectSiteObservationSummaries = (
  projectId: number | undefined,
  enabled = true
): ProjectSiteObservationSummary[] => {
  const [listProjectSites, listProjectSitesResponse] = useLazyListPlantingSitesQuery();
  const [listSummariesForSite] = useLazyListObservationSummariesQuery();
  const [siteSummaries, setSiteSummaries] = useState<ProjectSiteObservationSummary[]>([]);

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
    let cancelled = false;
    void Promise.all(
      projectSites.map(async (site) => {
        try {
          const result = await listSummariesForSite({ plantingSiteId: site.id }, true).unwrap();
          return { site, summary: result.summaries[0] };
        } catch {
          return { site, summary: undefined };
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setSiteSummaries(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, listSummariesForSite, projectId, projectSites]);

  return siteSummaries;
};

export default useProjectSiteObservationSummaries;
