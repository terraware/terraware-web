import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import usePlantingSite from 'src/hooks/usePlantingSite';
import {
  useLazyListObservationSummariesQuery,
  useListObservationSummariesQuery,
} from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { StratumObservationSummary } from 'src/types/Observations';

type HighestAndLowestSurvivalRateStrataCardProps = {
  plantingSiteId?: number;
  projectId?: number;
};

type StratumWithSite = {
  stratumId: number;
  survivalRate: number;
  site: PlantingSitePayload;
};

export default function HighestAndLowestSurvivalRateStrataCard({
  plantingSiteId,
  projectId,
}: HighestAndLowestSurvivalRateStrataCardProps): JSX.Element {
  const theme = useTheme();
  const isProjectView = !plantingSiteId && projectId !== undefined;

  const { plantingSite } = usePlantingSite(plantingSiteId);

  const observationSummariesQuery = useListObservationSummariesQuery(
    { plantingSiteId: plantingSiteId ?? -1 },
    { skip: !plantingSiteId || plantingSiteId === -1 }
  );

  const [listProjectSites, listProjectSitesResponse] = useLazyListPlantingSitesQuery();
  const [listSummariesForSite] = useLazyListObservationSummariesQuery();
  const [projectSiteSummaries, setProjectSiteSummaries] = useState<
    { site: PlantingSitePayload; strata: StratumObservationSummary[] }[]
  >([]);

  useEffect(() => {
    if (isProjectView && projectId) {
      void listProjectSites({ projectId, full: true, includeZones: false }, true);
    }
  }, [isProjectView, listProjectSites, projectId]);

  const projectSites = useMemo(
    () => (isProjectView ? listProjectSitesResponse.currentData?.sites ?? [] : []),
    [isProjectView, listProjectSitesResponse]
  );

  useEffect(() => {
    if (!isProjectView) {
      return;
    }
    let cancelled = false;
    void Promise.all(
      projectSites.map(async (site) => {
        try {
          const result = await listSummariesForSite({ plantingSiteId: site.id }, true).unwrap();
          return { site, strata: result.summaries[0]?.strata ?? [] };
        } catch {
          return { site, strata: [] as StratumObservationSummary[] };
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setProjectSiteSummaries(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isProjectView, listSummariesForSite, projectSites]);

  const survivalRateData = useMemo(() => {
    const candidates: StratumWithSite[] = isProjectView
      ? projectSiteSummaries.flatMap(({ site, strata }) =>
          strata
            .filter((stratum) => stratum.survivalRate !== undefined)
            .map((stratum) => ({
              stratumId: stratum.stratumId,
              survivalRate: stratum.survivalRate as number,
              site,
            }))
        )
      : (observationSummariesQuery.data?.summaries?.[0]?.strata ?? [])
          .filter((stratum) => stratum.survivalRate !== undefined && plantingSite)
          .map((stratum) => ({
            stratumId: stratum.stratumId,
            survivalRate: stratum.survivalRate as number,
            site: plantingSite as PlantingSitePayload,
          }));

    if (candidates.length === 0) {
      return {
        highestSurvivalRate: undefined,
        lowestSurvivalRate: undefined,
        highestStratum: undefined,
        lowestStratum: undefined,
      };
    }

    let highest = candidates[0];
    let lowest = candidates[0];
    for (const c of candidates) {
      if (c.survivalRate >= highest.survivalRate) {
        highest = c;
      }
      if (c.survivalRate < lowest.survivalRate) {
        lowest = c;
      }
    }

    return {
      highestSurvivalRate: highest.survivalRate,
      lowestSurvivalRate: lowest.survivalRate,
      highestStratum: highest.site.strata?.find((s) => s.id === highest.stratumId),
      lowestStratum: lowest.site.strata?.find((s) => s.id === lowest.stratumId),
      highestSite: highest.site,
      lowestSite: lowest.site,
    };
  }, [isProjectView, observationSummariesQuery.data?.summaries, plantingSite, projectSiteSummaries]);

  const highestSurvivalRate = survivalRateData.highestSurvivalRate;
  const lowestSurvivalRate = survivalRateData.lowestSurvivalRate;
  const highestStratum = survivalRateData.highestStratum;
  const lowestStratum = survivalRateData.lowestStratum;
  const highestSite = survivalRateData.highestSite;
  const lowestSite = survivalRateData.lowestSite;

  const highestStratumLabel = useMemo(
    () =>
      highestStratum
        ? isProjectView && highestSite
          ? `${highestStratum.name} (${highestSite.name})`
          : highestStratum.name
        : undefined,
    [highestStratum, highestSite, isProjectView]
  );

  const lowestStratumLabel = useMemo(
    () =>
      lowestStratum
        ? isProjectView && lowestSite
          ? `${lowestStratum.name} (${lowestSite.name})`
          : lowestStratum.name
        : undefined,
    [lowestStratum, lowestSite, isProjectView]
  );

  const isSameStratum =
    highestStratum && lowestStratum && highestStratum.id === lowestStratum.id && highestSite?.id === lowestSite?.id;

  return (
    <Box>
      {highestStratum && highestSurvivalRate !== undefined && (
        <>
          <Box
            sx={{
              backgroundColor: '#5D822B33',
              padding: 1,
              borderRadius: 1,
              marginBottom: 1,
            }}
          >
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {highestStratumLabel}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestSurvivalRate} />%
            </Typography>
          </Box>
          {(!lowestStratum || isSameStratum) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestStratum && !isSameStratum && (
        <Box
          sx={{
            backgroundColor: '#CB4D4533',
            padding: 1,
            borderRadius: 1,
          }}
        >
          <Typography fontSize='16px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {lowestStratumLabel}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            <FormattedNumber value={lowestSurvivalRate || 0} />%
          </Typography>
        </Box>
      )}
      {highestSurvivalRate === undefined && lowestSurvivalRate === undefined && (
        <>
          <Box
            sx={{
              backgroundColor: '#5D822B33',
              padding: 1,
              borderRadius: 1,
              marginBottom: 1,
            }}
          >
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {strings.CANNOT_BE_CALCULATED}
            </Typography>
            <Box height={'36px'} />
          </Box>
          <Box
            sx={{
              backgroundColor: '#CB4D4533',
              padding: 1,
              borderRadius: 1,
            }}
          >
            <Typography fontSize='16px' fontWeight={400}>
              {strings.LOWEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {strings.CANNOT_BE_CALCULATED}
            </Typography>
            <Box height={'36px'} />
          </Box>
        </>
      )}
    </Box>
  );
}
