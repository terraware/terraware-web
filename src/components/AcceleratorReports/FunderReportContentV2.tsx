import React, { type JSX, type ReactNode, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import { ProgressIndicator } from 'src/components/AcceleratorReports/IndicatorProgressRow';
import { IndicatorProgressSectionContent } from 'src/components/AcceleratorReports/IndicatorProgressSection';
import { ProjectHealthBarContent } from 'src/components/AcceleratorReports/ProjectHealthBar';
import Card from 'src/components/common/Card';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';

export type FunderReportContentV2Props = {
  /** the report selector in the funder portal, or a static report name in the console preview */
  header?: ReactNode;
  indicators: ProgressIndicator[];
  projectId: number;
  report?: AcceleratorReportPayload | PublishedReportPayload;
};

/**
 * The report as funders see it. Every section is read-only: passing neither `isConsoleView` nor
 * `canEdit` keeps the boxes' edit affordances and the indicators' internal-only markers hidden.
 * Callers are responsible for handing over only the indicators funders are allowed to see.
 */
const FunderReportContentV2 = ({ header, indicators, projectId, report }: FunderReportContentV2Props): JSX.Element => {
  const theme = useTheme();

  // the highlights box holds its own copy of the text, so it is remounted when the report changes
  const reportKey = useMemo(
    () => (report === undefined ? undefined : isAcceleratorReport(report) ? report.id : report.reportId),
    [report]
  );

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      {header !== undefined && <Box marginBottom={theme.spacing(3)}>{header}</Box>}

      <ProjectHealthBarContent indicators={indicators} />

      <HighlightsBox key={reportKey} projectId={projectId} report={report} />

      <IndicatorProgressSectionContent
        indicators={indicators}
        quarter={report?.quarter}
        year={report?.startDate ? Number(report.startDate.split('-')[0]) : undefined}
      />

      <AchievementsBox projectId={projectId} report={report} />

      <ChallengesMitigationBox projectId={projectId} report={report} />

      <FinancialSummariesBox projectId={projectId} report={report} />

      <AdditionalCommentsBox projectId={projectId} report={report} />
    </Card>
  );
};

export default FunderReportContentV2;
