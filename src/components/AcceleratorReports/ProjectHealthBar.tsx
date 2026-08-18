import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';
import { MetricStatus } from 'src/types/AcceleratorReport';

type ProjectHealthIndicator = {
  status?: MetricStatus;
};

export type ProjectHealthBarContentProps = {
  indicators: ProjectHealthIndicator[];
};

export const ProjectHealthBarContent = ({ indicators }: ProjectHealthBarContentProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const counts = useMemo(() => {
    const countOf = (status: MetricStatus) => indicators.filter((indicator) => indicator.status === status).length;

    return {
      achieved: countOf('Achieved'),
      noStatus: indicators.filter((indicator) => !indicator.status).length,
      offTrack: countOf('Off-Track'),
      onTrack: countOf('On-Track'),
      unlikely: countOf('Unlikely'),
    };
  }, [indicators]);

  const barSegments = useMemo(
    () => [
      { color: theme.palette.TwClrBgSuccess, count: counts.achieved + counts.onTrack, key: 'achievedOnTrack' },
      { color: theme.palette.TwClrBgWarning, count: counts.offTrack, key: 'offTrack' },
      { color: theme.palette.TwClrBgDanger, count: counts.unlikely, key: 'unlikely' },
      { color: theme.palette.TwClrBaseGray300, count: counts.noStatus, key: 'noStatus' },
    ],
    [counts, theme]
  );

  const legendEntries = useMemo(
    () => [
      { color: theme.palette.TwClrBgSuccess, count: counts.achieved, label: strings.ACHIEVED },
      { color: theme.palette.TwClrBgSuccess, count: counts.onTrack, label: strings.ON_TRACK },
      { color: theme.palette.TwClrBgWarning, count: counts.offTrack, label: strings.OFF_TRACK },
      { color: theme.palette.TwClrBgDanger, count: counts.unlikely, label: strings.UNLIKELY },
      { color: theme.palette.TwClrBaseGray300, count: counts.noStatus, label: strings.NO_STATUS },
    ],
    [counts, strings, theme]
  );

  if (indicators.length === 0) {
    return null;
  }

  return (
    <Box
      border={`1px solid ${theme.palette.TwClrBaseGray100}`}
      borderRadius={theme.spacing(1)}
      marginBottom={theme.spacing(3)}
      padding={theme.spacing(2)}
      width='100%'
    >
      <Box display='flex' alignItems='center'>
        <strong>{strings.PROJECT_HEALTH}</strong>
      </Box>

      <Box
        borderRadius={theme.spacing(0.5)}
        display='flex'
        height={theme.spacing(1)}
        marginTop={theme.spacing(2)}
        overflow='hidden'
      >
        {barSegments
          .filter((segment) => segment.count > 0)
          .map((segment) => (
            <Box bgcolor={segment.color} flexGrow={segment.count} key={segment.key} />
          ))}
      </Box>

      <Box
        columnGap={theme.spacing(3)}
        display='flex'
        flexWrap='wrap'
        marginTop={theme.spacing(1.5)}
        rowGap={theme.spacing(1)}
      >
        {legendEntries.map((entry) => (
          <Box alignItems='center' columnGap={theme.spacing(1)} display='flex' key={entry.label}>
            <Box bgcolor={entry.color} borderRadius='50%' height={theme.spacing(1)} width={theme.spacing(1)} />

            <Typography fontSize='14px'>{`${entry.count} ${entry.label}`}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

type ProjectHealthBarProps = {
  reportId?: number;
};

const ProjectHealthBar = ({ reportId }: ProjectHealthBarProps): JSX.Element | null => {
  const { report } = useOneAcceleratorReport(reportId);

  const indicators = useMemo(
    () => [
      ...(report?.autoCalculatedIndicators ?? []),
      ...(report?.commonIndicators ?? []),
      ...(report?.projectIndicators ?? []),
    ],
    [report]
  );

  return <ProjectHealthBarContent indicators={indicators} />;
};

export default ProjectHealthBar;
