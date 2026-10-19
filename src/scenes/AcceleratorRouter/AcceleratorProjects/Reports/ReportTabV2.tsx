import React, { type JSX, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import IndicatorProgressSection from 'src/components/AcceleratorReports/IndicatorProgressSection';
import ProjectHealthBar from 'src/components/AcceleratorReports/ProjectHealthBar';
import QuarterlyHighlightsBox from 'src/components/AcceleratorReports/QuarterlyHighlightsBox';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import ReportMessages from 'src/components/AcceleratorReports/ReportMessages';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useFeatureEnabled } from 'src/features';
import { SCROLL_ANCHOR } from 'src/hooks/useScrollRestoration';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import { useListAcceleratorReportsQuery } from 'src/queries/generated/acceleratorReports';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import ReportActions from './ReportActions';
import ReportInternalComment from './ReportInternalComment';

type ReportTabV2Props = {
  active?: boolean;
  header?: ReactNode;
  onSelectReport?: (reportId: number, replace?: boolean) => void;
  selectedReportId?: number;
};

const ReportTabV2 = ({ active, header, onSelectReport, selectedReportId }: ReportTabV2Props): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const cleanUpTabsEnabled = useFeatureEnabled('Clean Up Console Tabs');
  const trackEvent = useTrackEvent();
  const pathParams = useParams<{ projectId: string; reportId?: string }>();
  const navigate = useSyncNavigate();

  const location = useStateLocation();

  const projectId = Number(pathParams.projectId);
  const currentReportId = onSelectReport ? selectedReportId : Number(pathParams.reportId) || undefined;

  const inProjectTab = onSelectReport !== undefined;

  const goToQuarterlyHighlights = useCallback(
    (quarter?: string) => {
      const projectViewPath = APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`);
      const params = new URLSearchParams(cleanUpTabsEnabled && inProjectTab ? location.search : '');

      if (cleanUpTabsEnabled) {
        params.set('tab', 'quarterlyHighlights');
      } else {
        params.set('tab', 'activityLog');
        params.set('showHighlights', 'true');
      }

      if (quarter) {
        params.set('highlightsQuarter', quarter);
      }

      navigate(getLocation(projectViewPath, location, `?${params.toString()}`));
    },
    [cleanUpTabsEnabled, inProjectTab, location, navigate, projectId]
  );

  const selectReport = useCallback(
    (reportId: number, replace = false) => {
      if (onSelectReport) {
        onSelectReport(reportId, replace);
        return;
      }

      navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)}/${reportId}`, {
        replace,
      });
    },
    [navigate, onSelectReport, projectId]
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
    () => reports.find((report) => report.reportId === currentReportId)?.reportId ?? reports[0]?.reportId,
    [currentReportId, reports]
  );

  // the reports path has no report of its own, so send it to the latest one
  useEffect(() => {
    if (active && resolvedReportId !== undefined && currentReportId !== resolvedReportId) {
      selectReport(resolvedReportId, true);
    }
  }, [active, currentReportId, resolvedReportId, selectReport]);

  useEffect(() => {
    if (active && resolvedReportId !== undefined) {
      trackEvent(MIXPANEL_EVENTS.REPORT_VIEWED, { viewer_persona: 'accelerator_admin' });
    }
  }, [active, resolvedReportId, trackEvent]);

  const selectedReport = useMemo(
    () => listReportsData?.reports.find((report) => report.id === resolvedReportId),
    [listReportsData, resolvedReportId]
  );

  const { currentData: listPublishedReportsData } = useListPublishedReportsQuery(projectId);

  const lastPublished = useMemo(() => {
    const publishedTime = listPublishedReportsData?.reports.find(
      (report) => report.reportId === resolvedReportId
    )?.publishedTime;

    return publishedTime
      ? strings.formatString(strings.FUNDER_REPORT_LAST_PUBLISHED, getDateDisplayValue(publishedTime)).toString()
      : undefined;
  }, [listPublishedReportsData, resolvedReportId, strings]);

  const isEmpty = listReportsData !== undefined && reports.length === 0;

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginTop: cleanUpTabsEnabled ? 0 : theme.spacing(3),
      }}
    >
      {header && <Box marginBottom={theme.spacing(3)}>{header}</Box>}

      {isEmpty ? (
        <ReportEmptyState />
      ) : (
        <>
          <Box marginBottom={theme.spacing(3)} {...{ [SCROLL_ANCHOR]: 'reportTitle' }}>
            <Box alignItems='center' display='flex' justifyContent='space-between'>
              <ReportDropdown onChange={selectReport} reports={reports} selectedReportId={resolvedReportId} />

              {cleanUpTabsEnabled
                ? resolvedReportId !== undefined && <ReportActions projectId={projectId} reportId={resolvedReportId} />
                : selectedReport && <AcceleratorReportStatusBadge status={selectedReport.status} />}
            </Box>

            {lastPublished && (
              <Typography color={theme.palette.TwClrTxt} fontSize='14px' lineHeight='20px'>
                {lastPublished}
              </Typography>
            )}
          </Box>

          {resolvedReportId !== undefined && <ReportMessages isConsoleView reportId={resolvedReportId} />}

          {selectedReport && <ReportInternalComment projectId={projectId} report={selectedReport} />}

          <ProjectHealthBar reportId={resolvedReportId} />

          <HighlightsBox key={resolvedReportId} projectId={projectId} report={selectedReport} />

          <IndicatorProgressSection isConsoleView reportId={resolvedReportId} />

          <AchievementsBox projectId={projectId} report={selectedReport} />

          <ChallengesMitigationBox projectId={projectId} report={selectedReport} />

          <FinancialSummariesBox projectId={projectId} report={selectedReport} />

          <AdditionalCommentsBox projectId={projectId} report={selectedReport} />

          <QuarterlyHighlightsBox
            onViewHighlights={goToQuarterlyHighlights}
            projectId={projectId}
            report={selectedReport}
          />
        </>
      )}
    </Card>
  );
};

export default ReportTabV2;
