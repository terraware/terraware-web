import React, { useMemo } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { isReportSystemMetric } from 'src/components/AcceleratorReports/MetricBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import { PublishedReportMetric } from 'src/types/AcceleratorReport';
import { useNumberFormatter } from 'src/utils/useNumber';

type MetricBoxProps = {
  metric: PublishedReportMetric;
  index: number;
  year: string;
  quarter?: string;
  lastIndex: boolean;
};

const MetricBox = ({ metric, index, year, quarter, lastIndex }: MetricBoxProps) => {
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);
  const addPercentSign = useMemo(() => {
    return metric.name === 'Mortality Rate' ? '%' : '';
  }, [metric]);

  return (
    <Box
      flexBasis={'calc(50% - 24px)'}
      flexShrink={0}
      marginTop={3}
      borderRight={isDesktop ? (index % 2 !== 0 ? 'none' : `1px solid ${theme.palette.TwClrBrdrTertiary}`) : 'none'}
      borderBottom={isDesktop || lastIndex ? 'none' : `1px solid ${theme.palette.TwClrBrdrTertiary}`}
      marginRight={3}
      paddingBottom={isDesktop ? 0 : 3}
      paddingRight={isDesktop ? 3 : 0}
    >
      <Box display={'flex'} alignItems={'center'}>
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
        {metric.status && <MetricStatusBadge status={metric.status} />}
      </Box>
      <Box display='flex' marginTop={1}>
        <Box flex='0 0 50%'>
          <Typography fontWeight={600}>
            {year} {strings.TARGET}
          </Typography>
          <Typography fontSize={'24px'} fontWeight={600}>
            {metric.target !== undefined && numberFormatter.format(metric.target)} {metric.target ? addPercentSign : ''}
          </Typography>
        </Box>
        <Box flex='0 0 50%'>
          <Typography fontWeight={600}>
            {quarter} {strings.PROGRESS}
          </Typography>
          <Typography fontSize={'24px'} fontWeight={600}>
            {metric.value !== undefined && numberFormatter.format(metric.value)} {metric.value ? addPercentSign : ''}
          </Typography>
        </Box>
      </Box>
      {'progressNotes' in metric && (
        <Box>
          <Typography fontWeight={600} fontSize='16px' marginTop={1}>
            {strings.PROGRESS_NOTES}
          </Typography>
          <Textfield
            display
            preserveNewlines
            id='progressNotes'
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
