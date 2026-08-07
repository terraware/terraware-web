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
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useLazyListAcceleratorReportsQuery } from 'src/queries/generated/reports';

export type AcceleratorReportTabV2Props = {
  active?: boolean;
};

const AcceleratorReportTabV2 = ({ active }: AcceleratorReportTabV2Props): JSX.Element => {
  const theme = useTheme();
  const { allAcceleratorProjects, currentAcceleratorProject, setCurrentAcceleratorProject } = useParticipantData();
  const navigate = useSyncNavigate();
  const pathParams = useParams<{ reportId?: string }>();

  const pathReportId = Number(pathParams.reportId) || undefined;

  const selectReport = useCallback(
    (reportId: number, replace = false) => navigate(`${APP_PATHS.REPORTS}/${reportId}`, { replace }),
    [navigate]
  );

  // A linked report says which project it belongs to, which need not be the one already selected
  const { report: selectedReport } = useOneAcceleratorReport(pathReportId);

  const selectedProjectId = selectedReport?.projectId;

  useEffect(() => {
    if (
      selectedProjectId !== undefined &&
      selectedProjectId !== currentAcceleratorProject?.id &&
      allAcceleratorProjects.some((project) => project.id === selectedProjectId)
    ) {
      setCurrentAcceleratorProject(selectedProjectId);
    }
  }, [allAcceleratorProjects, currentAcceleratorProject?.id, selectedProjectId, setCurrentAcceleratorProject]);

  const projectId = currentAcceleratorProject?.id;

  const [listReports, listReportsResponse] = useLazyListAcceleratorReportsQuery();

  useEffect(() => {
    if (projectId !== undefined) {
      void listReports({ projectId }, true);
    }
  }, [listReports, projectId]);

  const reports = useMemo<ReportOption[]>(
    () =>
      listReportsResponse.currentData?.reports.map((report) => ({
        reportId: report.id,
        title: getReportName(report) ?? '',
      })) ?? [],
    [listReportsResponse.currentData]
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

  const isEmpty = listReportsResponse.currentData !== undefined && reports.length === 0;

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

          <ProjectHealthBar reportId={resolvedReportId} />

          {projectId !== undefined && (
            <HighlightsBox key={resolvedReportId} projectId={projectId} report={selectedReport} />
          )}

          <IndicatorProgressSection reportId={resolvedReportId} />

          {projectId !== undefined && (
            <>
              <AchievementsBox projectId={projectId} report={selectedReport} />

              <ChallengesMitigationBox projectId={projectId} report={selectedReport} />

              <FinancialSummariesBox projectId={projectId} report={selectedReport} />

              <AdditionalCommentsBox projectId={projectId} report={selectedReport} />
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default AcceleratorReportTabV2;
