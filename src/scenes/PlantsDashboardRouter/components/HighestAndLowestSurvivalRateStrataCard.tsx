import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { useProjectSiteObservationStats, useSiteObservationStats } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';

type HighestAndLowestSurvivalRateStrataCardProps = {
  plantingSiteId?: number;
  projectId?: number | 'all';
};

type RankedStratum = {
  stratumId: number;
  stratumName: string;
  site: PlantingSitePayload;
  survivalRate: number;
};

export default function HighestAndLowestSurvivalRateStrataCard({
  plantingSiteId,
  projectId,
}: HighestAndLowestSurvivalRateStrataCardProps): JSX.Element {
  const theme = useTheme();
  const isProjectView = !plantingSiteId && typeof projectId === 'number';

  const { plantingSite } = usePlantingSite(plantingSiteId);
  const { stats } = useSiteObservationStats(plantingSiteId);
  const projectSiteStats = useProjectSiteObservationStats(
    typeof projectId === 'number' ? projectId : undefined,
    isProjectView
  );

  const siteStats = useMemo(() => {
    if (isProjectView) {
      return projectSiteStats;
    }
    return plantingSite ? [{ site: plantingSite, stats }] : [];
  }, [isProjectView, plantingSite, projectSiteStats, stats]);

  const survivalRateData = useMemo(() => {
    // Stratum names live on the planting site; the stats payload is keyed by id.
    const candidates: RankedStratum[] = siteStats.flatMap(({ site, stats: siteStat }) =>
      (siteStat?.strata ?? []).flatMap((stratum) => {
        const stratumName = site.strata?.find(({ id }) => id === stratum.stratumId)?.name;
        return stratum.survivalRate !== undefined && stratumName !== undefined
          ? [{ stratumId: stratum.stratumId, stratumName, site, survivalRate: stratum.survivalRate }]
          : [];
      })
    );

    if (candidates.length === 0) {
      return {
        highestSurvivalRate: undefined,
        lowestSurvivalRate: undefined,
        highest: undefined,
        lowest: undefined,
      };
    }

    let highestSoFar = candidates[0];
    let lowestSoFar = candidates[0];
    for (const candidate of candidates) {
      if (candidate.survivalRate >= highestSoFar.survivalRate) {
        highestSoFar = candidate;
      }
      if (candidate.survivalRate < lowestSoFar.survivalRate) {
        lowestSoFar = candidate;
      }
    }

    return {
      highestSurvivalRate: highestSoFar.survivalRate,
      lowestSurvivalRate: lowestSoFar.survivalRate,
      highest: highestSoFar,
      lowest: lowestSoFar,
    };
  }, [siteStats]);

  const { highestSurvivalRate, lowestSurvivalRate, highest, lowest } = survivalRateData;

  const highestStratumLabel = useMemo(
    () =>
      highest ? (isProjectView ? `${highest.stratumName} (${highest.site.name})` : highest.stratumName) : undefined,
    [highest, isProjectView]
  );

  const lowestStratumLabel = useMemo(
    () => (lowest ? (isProjectView ? `${lowest.stratumName} (${lowest.site.name})` : lowest.stratumName) : undefined),
    [lowest, isProjectView]
  );

  const isSameStratum =
    highest && lowest && highest.stratumId === lowest.stratumId && highest.site.id === lowest.site.id;

  return (
    <Box>
      {highest && highestSurvivalRate !== undefined && (
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
          {(!lowest || isSameStratum) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowest && !isSameStratum && (
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
