import React, { useMemo } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { isReportSystemMetric } from 'src/components/AcceleratorReports/MetricBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import { PublishedReportMetric } from 'src/types/AcceleratorReport';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type MetricBoxProps = {
  metric: PublishedReportMetric;
  index: number;
  year: string;
  quarter?: string;
  length: number;
};

const MetricBox = ({ metric, index, year, quarter, length }: MetricBoxProps) => {
  const { isDesktop, isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);
  const addPercentSign = useMemo(() => {
    return ['Mortality Rate', 'Survival Rate'].includes(metric.name) ? '%' : '';
  }, [metric]);

  const showRow = useMemo(() => {
    if (!isDesktop) {
      return index !== length - 1;
    }

    const isEven = length % 2 === 0;
    if (isEven) {
      return index < length - 2;
    }

    return index < length - 1;
  }, [isDesktop, index, length]);

  return (
    <Box
      flexBasis={'calc(50% - 24px)'}
      flexShrink={0}
      marginTop={3}
      borderBottom={showRow ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : 'none'}
      paddingBottom={3}
    >
      <Box display={isMobile ? 'block' : 'flex'} alignItems={'center'} paddingRight={isDesktop ? 3 : 0} marginRight={3}>
        <Box display={'flex'} alignItems={'center'} marginBottom={isMobile ? 1 : 0}>
          <Typography fontSize='20px' fontWeight={600} paddingRight={'10px'}>
            {isReportSystemMetric(metric) ? metric.metric : metric.name}
          </Typography>
          {metric.description && (
            <Tooltip title={metric.description}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' style={{ marginRight: '10px' }} />
              </Box>
            </Tooltip>
          )}
        </Box>
        {metric.status && <MetricStatusBadge status={metric.status} />}
      </Box>
      <Box display='flex' marginTop={1} paddingRight={isDesktop ? 3 : 0} marginRight={3}>
        <Box flex='0 0 50%'>
          <Typography fontWeight={600}>
            {quarter} {year} {strings.TARGET}
          </Typography>
          <Typography fontSize={'24px'} fontWeight={600}>
            {metric.target !== undefined && numberFormatter.format(metric.target)} {metric.target ? addPercentSign : ''}
            {metric.target !== undefined ? metric.unit : ''}
          </Typography>
        </Box>
        <Box flex='0 0 50%'>
          <Typography fontWeight={600}>
            {quarter} {strings.PROGRESS}
          </Typography>
          <Typography fontSize={'24px'} fontWeight={600}>
            {metric.value !== undefined && numberFormatter.format(metric.value)} {metric.value ? addPercentSign : ''}
            {metric.value !== undefined ? metric.unit : ''}
          </Typography>
        </Box>
      </Box>
      {'progressNotes' in metric && (
        <Box paddingRight={isDesktop ? 3 : 0} marginRight={3}>
          <Typography fontWeight={600} fontSize='16px' marginTop={1}>
            {strings.PROGRESS_NOTES}
          </Typography>
          <Textfield
            display
            preserveNewlines
            id='progressNotes'
            markdown
            type='textarea'
            value={metric.progressNotes}
            truncateConfig={{
              maxHeight: 240,
              showMoreText: strings.SEE_MORE,
              showLessText: strings.SEE_LESS,
              alignment: 'right',
            }}
            label={''}
          />
        </Box>
      )}
    </Box>
  );
};

export default MetricBox;
