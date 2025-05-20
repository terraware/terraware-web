import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { PublishedReport, PublishedReportMetric } from 'src/types/AcceleratorReport';

import MetricBox from './MetricBox';

type FunderReportViewProps = {
  selectedProjectId?: number;
  selectedReport?: PublishedReport;
};

const FunderReportView = ({ selectedProjectId, selectedReport }: FunderReportViewProps) => {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const year = useMemo(() => {
    return selectedReport?.startDate?.split('-')[0];
  }, [selectedReport]);

  const allMetrics: PublishedReportMetric[] = [];

  ['system', 'project', 'standard'].map((type) => {
    const metrics =
      type === 'system'
        ? selectedReport?.systemMetrics
        : type === 'project'
          ? selectedReport?.projectMetrics
          : selectedReport?.standardMetrics;
    if (metrics) {
      allMetrics.push(...metrics);
    }
  });

  const climateMetrics = allMetrics.filter((m) => m.component === 'Climate');
  const biodiversityMetrics = allMetrics.filter((m) => m.component === 'Biodiversity');
  const communityMetrics = allMetrics.filter((m) => m.component === 'Community');

  const metricBoxStyle = { borderRadius: '8px', paddingTop: 0, display: 'flex' };

  return (
    <Box>
      <Box display={isDesktop ? 'flex' : 'block'}>
        <Card
          style={{
            width: '100%',
            borderRadius: '8px',
            marginRight: 3,
          }}
        >
          <Typography fontSize={20} fontWeight={600}>
            {strings.HIGHLIGHTS}
          </Typography>
          <Typography marginTop={3} whiteSpace={'pre-line'}>
            {selectedReport?.highlights}
          </Typography>
        </Card>
        <Card
          style={{
            borderRadius: '8px',
            marginTop: isDesktop ? 0 : 3,
          }}
        >
          <Typography fontSize={20} fontWeight={600}>
            {strings.LEGEND}
          </Typography>
          <Box>
            <Box display='flex' marginTop={2}>
              <Box flexBasis={'81px'} flexShrink={0} marginRight={1}>
                <MetricStatusBadge status='Achieved' />
              </Box>
              <Typography>{strings.METRIC_STATUS_DESCRIPTION_ARCHIVED}</Typography>
            </Box>
            <Box display='flex' marginTop={3}>
              <Box flexBasis={'81px'} flexShrink={0} marginRight={1}>
                <MetricStatusBadge status='On-Track' />
              </Box>
              <Typography>{strings.METRIC_STATUS_DESCRIPTION_ON_TRACK}</Typography>
            </Box>
            <Box display='flex' marginTop={3}>
              <Box flexBasis={'81px'} flexShrink={0} marginRight={1}>
                <MetricStatusBadge status='Unlikely' />
              </Box>
              <Typography>{strings.METRIC_STATUS_DESCRIPTION_UNLIKELY}</Typography>
            </Box>
          </Box>
        </Card>
      </Box>
      {year && (
        <>
          {climateMetrics.length > 0 && (
            <Box width='100%'>
              <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.CLIMATE}
              </Typography>

              <Card style={metricBoxStyle}>
                <Box display={isDesktop ? 'flex' : 'block'} flexWrap='wrap'>
                  {climateMetrics?.map((metric, index) => (
                    <MetricBox
                      metric={metric}
                      index={index}
                      year={year}
                      quarter={selectedReport?.quarter}
                      key={index}
                      lastIndex={index === climateMetrics.length - 1}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}
          {biodiversityMetrics.length > 0 && (
            <Box width='100%'>
              <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.BIODIVERSITY}
              </Typography>

              <Card style={metricBoxStyle}>
                <Box display={isDesktop ? 'flex' : 'block'} flexWrap='wrap'>
                  {biodiversityMetrics?.map((metric, index) => (
                    <MetricBox
                      metric={metric}
                      index={index}
                      year={year}
                      quarter={selectedReport?.quarter}
                      key={index}
                      lastIndex={index === biodiversityMetrics.length - 1}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}
          {communityMetrics.length > 0 && (
            <Box width='100%'>
              <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.COMMUNITY}
              </Typography>

              <Card style={metricBoxStyle}>
                <Box display={isDesktop ? 'flex' : 'block'} flexWrap='wrap'>
                  {communityMetrics?.map((metric, index) => (
                    <MetricBox
                      metric={metric}
                      index={index}
                      year={year}
                      quarter={selectedReport?.quarter}
                      key={index}
                      lastIndex={index === communityMetrics.length - 1}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}
        </>
      )}
      {selectedProjectId && selectedReport?.achievements && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.ACHIEVEMENTS}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <AchievementsBox report={selectedReport} projectId={selectedProjectId.toString()} noTitle />
          </Card>
        </Box>
      )}
      {selectedProjectId && selectedReport?.challenges && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.CHALLENGES_AND_MITIGATION_PLAN}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <ChallengesMitigationBox report={selectedReport} projectId={selectedProjectId.toString()} noTitle />
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default FunderReportView;
