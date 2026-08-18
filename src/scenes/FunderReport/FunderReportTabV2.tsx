import React, { type JSX, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import { IndicatorProgressSectionContent } from 'src/components/AcceleratorReports/IndicatorProgressSection';
import { ProjectHealthBarContent } from 'src/components/AcceleratorReports/ProjectHealthBar';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import useQuery from 'src/utils/useQuery';

type FunderReportTabV2Props = {
  selectedProjectId: number;
};

const FunderReportTabV2 = ({ selectedProjectId }: FunderReportTabV2Props): JSX.Element => {
  const theme = useTheme();
  const query = useQuery();

  const [selectedReportId, setSelectedReportId] = useState<number | undefined>(
    Number(query.get('reportId')) || undefined
  );

  const { currentData: listPublishedReportsData } = useListPublishedReportsQuery(selectedProjectId);

  const reports = useMemo<ReportOption[]>(
    () =>
      listPublishedReportsData?.reports.map((report) => ({
        reportId: report.reportId,
        title: getReportName(report) ?? '',
      })) ?? [],
    [listPublishedReportsData]
  );

  const resolvedReportId = useMemo(
    () => reports.find((report) => report.reportId === selectedReportId)?.reportId ?? reports[0]?.reportId,
    [reports, selectedReportId]
  );

  const selectedReport = useMemo(
    () => listPublishedReportsData?.reports.find((report) => report.reportId === resolvedReportId),
    [listPublishedReportsData, resolvedReportId]
  );

  const indicators = useMemo(
    () => [
      ...(selectedReport?.autoCalculatedIndicators ?? []),
      ...(selectedReport?.commonIndicators ?? []),
      ...(selectedReport?.projectIndicators ?? []),
    ],
    [selectedReport]
  );

  const isEmpty = listPublishedReportsData !== undefined && reports.length === 0;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      {isEmpty ? (
        <ReportEmptyState />
      ) : (
        <>
          <Box marginBottom={theme.spacing(3)}>
            <ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={resolvedReportId} />
          </Box>

          <ProjectHealthBarContent indicators={indicators} />

          <HighlightsBox key={resolvedReportId} projectId={selectedProjectId} report={selectedReport} />

          <IndicatorProgressSectionContent
            indicators={indicators}
            quarter={selectedReport?.quarter}
            year={selectedReport?.startDate ? Number(selectedReport.startDate.split('-')[0]) : undefined}
          />

          <AchievementsBox projectId={selectedProjectId} report={selectedReport} />

          <ChallengesMitigationBox projectId={selectedProjectId} report={selectedReport} />

          <FinancialSummariesBox projectId={selectedProjectId} report={selectedReport} />

          <AdditionalCommentsBox projectId={selectedProjectId} report={selectedReport} />
        </>
      )}
    </Card>
  );
};

export default FunderReportTabV2;
