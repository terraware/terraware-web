import { useEffect, useMemo, useState } from 'react';

import { ObservationResultsPayload, useLazyGetObservationResultsQuery } from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

export type ProjectSiteObservationResult = {
  site: PlantingSitePayload;
  result?: ObservationResultsPayload;
};

/**
 * Fetches every planting site in a project and the latest observation result for each.
 * Returns an empty array until both fetches resolve. Skips entirely when `enabled` is false
 * or `projectId` is undefined. Replaces useProjectSiteObservationSummaries.
 */
const useProjectSiteObservationResults = (
  projectId: number | undefined,
  enabled = true
): ProjectSiteObservationResult[] => {
  const [listProjectSites, listProjectSitesResponse] = useLazyListPlantingSitesQuery();
  const [getObservationResults] = useLazyGetObservationResultsQuery();
  const [siteResults, setSiteResults] = useState<ProjectSiteObservationResult[]>([]);

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
        if (site.latestObservationId === undefined) {
          return { site, result: undefined };
        }
        try {
          const response = await getObservationResults(
            { observationId: site.latestObservationId, depth: 'Stratum' },
            true
          ).unwrap();
          return { site, result: response.observation };
        } catch {
          return { site, result: undefined };
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setSiteResults(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, getObservationResults, projectId, projectSites]);

  return siteResults;
};

export default useProjectSiteObservationResults;
