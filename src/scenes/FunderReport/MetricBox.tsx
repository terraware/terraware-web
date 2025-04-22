import React from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import { isReportSystemMetric } from 'src/components/AcceleratorReports/MetricBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import strings from 'src/strings';
import {
  PublishedReportMetric,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
} from 'src/types/AcceleratorReport';

type MetricBoxProps = {
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric | PublishedReportMetric;
  index: number;
  year: string;
  quarter?: string;
};

const MetricBox = ({ metric, index, year, quarter }: MetricBoxProps) => {
  const theme = useTheme();
  return (
    <Box
      flexBasis={'calc(50% - 24px)'}
      flexShrink={0}
      marginTop={3}
      borderRight={index % 2 !== 0 ? 'none' : `1px solid ${theme.palette.TwClrBrdr}`}
      marginRight={3}
    >
      <Box display={'flex'} alignItems={'center'}>
        <Typography fontSize='20px' fontWeight={600} paddingRight={'10px'}>
          {isReportSystemMetric(metric) ? metric.metric : metric.name}
        </Typography>
        {metric.description && (
          <Tooltip title={metric.description}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='medium' style={{ marginRight: '10px' }} />
            </Box>
          </Tooltip>
        )}
        {metric.status && <MetricStatusBadge status={metric.status} />}
      </Box>
      <Box display='flex' marginTop={1}>
        <Box flex='0 0 50%'>
          <Typography fontWeight={600}>
            {year} {strings.TARGET}
          </Typography>
          <Typography fontSize={'24px'} fontWeight={600}>
            {metric.target}
          </Typography>
        </Box>
        <Box flex='0 0 50%'>
          <Typography fontWeight={600}>
            {quarter} {strings.PROGRESS}
          </Typography>
          <Typography fontSize={'24px'} fontWeight={600}>
            {isReportSystemMetric(metric) ? metric.overrideValue || metric.systemValue : metric.value}
          </Typography>
        </Box>
      </Box>
      {'progressNotes' in metric && (
        <Box>
          <Typography fontWeight={500} fontSize='20px' marginTop={1}>
            {strings.PROGRESS_NOTES}
          </Typography>
          <Typography fontWeight={400}>{metric.progressNotes}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MetricBox;
