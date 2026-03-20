import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import PhotosBox from 'src/components/AcceleratorReports/PhotosBox';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { PublishedReportIndicatorPayload, PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { ReportCommonIndicatorPayload } from 'src/queries/generated/reports';

import MetricRow from '../AcceleratorRouter/AcceleratorProjects/Reports/MetricRow';

type FunderReportViewProps = {
  selectedProjectId: number;
  selectedReport?: PublishedReportPayload;
};

const FunderReportView = ({ selectedProjectId, selectedReport }: FunderReportViewProps) => {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { strings } = useLocalization();

  const year = useMemo(() => {
    return selectedReport?.startDate?.split('-')[0];
  }, [selectedReport]);

  const allIndicators = useMemo((): ReportCommonIndicatorPayload[] => {
    let id = 0;
    const result: ReportCommonIndicatorPayload[] = [];
    (['autoCalculatedIndicators', 'commonIndicators', 'projectIndicators'] as const).forEach((key) => {
      const indicators: PublishedReportIndicatorPayload[] = selectedReport?.[key] ?? [];
      indicators.forEach((ind) => {
        result.push({ ...ind, id: id++, isPublishable: true } as ReportCommonIndicatorPayload);
      });
    });
    return result;
  }, [selectedReport]);

  const climateIndicators = allIndicators.filter((m) => m.category === 'Climate');
  const biodiversityIndicators = allIndicators.filter((m) => m.category === 'Biodiversity');
  const communityIndicators = allIndicators.filter((m) => m.category === 'Community');
  const projectObjectivesIndicators = allIndicators.filter((m) => m.category === 'Project Objectives');

  const metricBoxStyle = { borderRadius: '8px', paddingTop: 0 };

  if (!selectedReport) {
    return;
  }

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
          <HighlightsBox report={selectedReport} projectId={selectedProjectId} funderReportView />
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
          {(
            [
              { label: strings.CLIMATE, indicators: climateIndicators },
              { label: strings.BIODIVERSITY, indicators: biodiversityIndicators },
              { label: strings.COMMUNITY, indicators: communityIndicators },
              { label: strings.PROJECT_OBJECTIVES, indicators: projectObjectivesIndicators },
            ] as const
          ).map(({ label, indicators }) =>
            indicators.length > 0 ? (
              <Box key={label} width='100%'>
                <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                  {label}
                </Typography>
                <Card style={metricBoxStyle}>
                  {indicators.map((indicator, index) => (
                    <MetricRow
                      key={index}
                      type='common'
                      metric={indicator}
                      reportLabel={selectedReport?.quarter}
                      year={Number(year)}
                      projectId={selectedProjectId}
                      reportId={selectedReport.reportId}
                      canEdit={false}
                      hideProjectsComments
                    />
                  ))}
                </Card>
              </Box>
            ) : null
          )}
        </>
      )}
      {selectedProjectId && selectedReport?.achievements?.length > 0 && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.ACHIEVEMENTS}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <AchievementsBox report={selectedReport} projectId={selectedProjectId} funderReportView canEdit={false} />
          </Card>
        </Box>
      )}
      {selectedProjectId && selectedReport?.challenges?.length > 0 && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.CHALLENGES_AND_MITIGATION_PLAN}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <ChallengesMitigationBox report={selectedReport} projectId={selectedProjectId} funderReportView />
          </Card>
        </Box>
      )}
      {selectedProjectId && selectedReport?.financialSummaries && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.FINANCIAL_SUMMARIES}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <FinancialSummariesBox report={selectedReport} projectId={selectedProjectId} funderReportView />
          </Card>
        </Box>
      )}
      {selectedProjectId && selectedReport?.additionalComments && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.ADDITIONAL_COMMENTS}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <AdditionalCommentsBox report={selectedReport} projectId={selectedProjectId} funderReportView />
          </Card>
        </Box>
      )}
      {selectedProjectId && selectedReport?.photos?.length > 0 && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.PHOTOS}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <PhotosBox report={selectedReport} projectId={selectedProjectId} funderReportView />
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default FunderReportView;
