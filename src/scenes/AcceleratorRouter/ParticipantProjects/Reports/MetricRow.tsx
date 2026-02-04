import React, { type JSX, useCallback, useState } from 'react';

import { Box, Collapse, Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import strings from 'src/strings';
import { MetricType, ReportProjectMetric, ReportStandardMetric, ReportSystemMetric } from 'src/types/AcceleratorReport';

export const isReportSystemMetric = (metric: any): metric is ReportSystemMetric => {
  return metric && typeof metric.metric === 'string';
};

const isStandardOrProjectMetric = (metric: any): metric is ReportStandardMetric | ReportProjectMetric => {
  return metric && typeof metric.id === 'number';
};

type MetricRowProps = {
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric;
  type: MetricType;
  reportLabel?: string;
  year?: string;
};

const MetricRow = ({ metric, reportLabel = '', year = '' }: MetricRowProps): JSX.Element => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getMetricName = () => {
    if (isStandardOrProjectMetric(metric)) {
      return metric.name;
    } else {
      return metric.metric;
    }
  };

  const getActualValue = () => {
    if (isStandardOrProjectMetric(metric)) {
      return metric.value || 0;
    } else {
      return metric.overrideValue || metric.systemValue || 0;
    }
  };

  const getUnit = () => {
    if (isStandardOrProjectMetric(metric) && 'unit' in metric) {
      return metric.unit;
    }
    return '';
  };

  const targetValue = metric.target || 0;
  const actualValue = getActualValue();
  const percentComplete = targetValue > 0 ? Math.round((actualValue / targetValue) * 100) : 0;

  const hasComments = !!metric.projectsComments || !!metric.progressNotes;

  const onToggle = useCallback(() => {
    if (hasComments) {
      setExpanded(!expanded);
    }
  }, [expanded, hasComments]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2, 3),
          cursor: hasComments ? 'pointer' : 'default',
          '&:hover': hasComments ? { backgroundColor: theme.palette.TwClrBaseGray025 } : {},
        }}
        onClick={onToggle}
      >
        {/* Metric Name and Progress Chart */}
        <Box flex={3} paddingRight={2}>
          <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
            {getMetricName()}
          </Typography>
          <Box>
            <Box display='flex' gap={1} marginBottom={0.5}>
              <Typography fontSize='12px' color={theme.palette.TwClrTxtSecondary}>
                {reportLabel}
              </Typography>
            </Box>
            {/* TODO: Show values from other quarters and annual target */}
            <ProgressChart value={actualValue} target={targetValue} />
          </Box>
        </Box>

        <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

        <Box flex={1} paddingX={2}>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
            {reportLabel} {strings.ACTUAL}
          </Typography>
          <Typography fontSize='20px' fontWeight={600}>
            {actualValue} {getUnit()}
          </Typography>
        </Box>

        <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

        <Box flex={1} paddingX={2}>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
            {year} {strings.TARGET}
          </Typography>
          <Typography fontSize='20px' fontWeight={600}>
            {targetValue} {getUnit()}
          </Typography>
        </Box>

        <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

        <Box flex={1} paddingX={2}>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
            % {strings.COMPLETE}
          </Typography>
          <Typography fontSize='20px' fontWeight={600}>
            {percentComplete}%
          </Typography>
        </Box>

        <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

        <Box flex={1} paddingX={2}>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
            {strings.STATUS}
          </Typography>
          {metric.status && <MetricStatusBadge status={metric.status} />}
        </Box>

        {hasComments && (
          <IconButton size='small' sx={{ marginLeft: 1 }}>
            <Icon
              name={expanded ? 'chevronUp' : 'chevronDown'}
              size='medium'
              fillColor={theme.palette.TwClrIcnSecondary}
            />
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <Box padding={theme.spacing(0, 3, 3, 3)}>
          <Divider sx={{ marginBottom: 3 }} />
          <Grid container spacing={3}>
            {metric.projectsComments && (
              <Grid item xs={6}>
                <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
                  {strings.PROJECTS_COMMENTS}
                </Typography>
                <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} sx={{ whiteSpace: 'pre-wrap' }}>
                  {metric.projectsComments}
                </Typography>
              </Grid>
            )}
            {metric.progressNotes && (
              <Grid item xs={6}>
                <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
                  {strings.PROGRESS_NOTES}
                </Typography>
                <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} sx={{ whiteSpace: 'pre-wrap' }}>
                  {metric.progressNotes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Collapse>

      <Divider />
    </Box>
  );
};

export default MetricRow;
