import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import IndicatorProgressSection from 'src/components/AcceleratorReports/IndicatorProgressSection';
import ProjectHealthBar from 'src/components/AcceleratorReports/ProjectHealthBar';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useListAcceleratorReportsQuery } from 'src/queries/generated/reports';

import ReportInternalComment from './ReportInternalComment';

export type ReportTabV2Props = {
  active?: boolean;
};

const ReportTabV2 = ({ active }: ReportTabV2Props): JSX.Element => {
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string; reportId?: string }>();
  const navigate = useSyncNavigate();

  const projectId = Number(pathParams.projectId);
  const pathReportId = Number(pathParams.reportId) || undefined;

  const selectReport = useCallback(
    (reportId: number, replace = false) =>
      navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)}/${reportId}`, {
        replace,
      }),
    [navigate, projectId]
  );

  const { currentData: listReportsData } = useListAcceleratorReportsQuery({ projectId });

  const reports = useMemo<ReportOption[]>(
    () =>
      listReportsData?.reports.map((report) => ({
        reportId: report.id,
        title: getReportName(report) ?? '',
      })) ?? [],
    [listReportsData]
  );

  const resolvedReportId = useMemo(
    () => reports.find((report) => report.reportId === pathReportId)?.reportId ?? reports[0]?.reportId,
    [pathReportId, reports]
  );

  // the reports path has no report of its own, so send it to the latest one
  useEffect(() => {
    if (active && resolvedReportId !== undefined && pathReportId !== resolvedReportId) {
      selectReport(resolvedReportId, true);
    }
  }, [active, pathReportId, resolvedReportId, selectReport]);

  const selectedReport = useMemo(
    () => listReportsData?.reports.find((report) => report.id === resolvedReportId),
    [listReportsData, resolvedReportId]
  );

  const isEmpty = listReportsData !== undefined && reports.length === 0;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      {isEmpty ? (
        <ReportEmptyState />
      ) : (
        <>
          <Box alignItems='center' display='flex' justifyContent='space-between' marginBottom={theme.spacing(3)}>
            <ReportDropdown onChange={selectReport} reports={reports} selectedReportId={resolvedReportId} />

            {selectedReport && <AcceleratorReportStatusBadge status={selectedReport.status} />}
          </Box>

          {selectedReport && <ReportInternalComment projectId={projectId} report={selectedReport} />}

          <ProjectHealthBar reportId={resolvedReportId} />

          <HighlightsBox key={resolvedReportId} projectId={projectId} report={selectedReport} />

          <IndicatorProgressSection reportId={resolvedReportId} />

          <AchievementsBox projectId={projectId} report={selectedReport} />

          <ChallengesMitigationBox projectId={projectId} report={selectedReport} />

          <FinancialSummariesBox projectId={projectId} report={selectedReport} />

          <AdditionalCommentsBox projectId={projectId} report={selectedReport} />
        </>
      )}
    </Card>
  );
};

export default ReportTabV2;
