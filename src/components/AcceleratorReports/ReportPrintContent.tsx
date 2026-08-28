import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import { IndicatorProgressSectionContent } from 'src/components/AcceleratorReports/IndicatorProgressSection';
import { ProjectHealthBarContent } from 'src/components/AcceleratorReports/ProjectHealthBar';
import { type ProgressIndicator, getReportName } from 'src/components/AcceleratorReports/utils';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';

export type ReportPrintContentProps = {
  indicators: ProgressIndicator[];
  projectId: number;
  projectName?: string;
  report: AcceleratorReportPayload | PublishedReportPayload;
};

const ReportPrintContent = ({ indicators, projectId, projectName, report }: ReportPrintContentProps): JSX.Element => {
  const theme = useTheme();

  const year = report.startDate ? Number(report.startDate.split('-')[0]) : undefined;

  const sectionProps = { canEdit: false, printMode: true, projectId, report } as const;

  return (
    <Box padding={theme.spacing(0, 3, 3)}>
      <Box
        alignItems='flex-start'
        display='flex'
        justifyContent='space-between'
        marginBottom={theme.spacing(3)}
        paddingTop={theme.spacing(3)}
      >
        <Box>
          {projectName && (
            <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
              {projectName}
            </Typography>
          )}

          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='20px' lineHeight='28px'>
            {getReportName(report)}
          </Typography>
        </Box>

        {/* a published report has no review status; it is by definition approved */}
        {isAcceleratorReport(report) && <AcceleratorReportStatusBadge status={report.status} />}
      </Box>

      <Box className='print-section'>
        <ProjectHealthBarContent indicators={indicators} />
      </Box>

      <Box className='print-section'>
        <HighlightsBox {...sectionProps} />
      </Box>

      {/* each row marks itself as unbreakable, so the section as a whole is free to span pages */}
      <IndicatorProgressSectionContent indicators={indicators} printMode quarter={report.quarter} year={year} />

      <Box className='print-section'>
        <AchievementsBox {...sectionProps} />
      </Box>

      <Box className='print-section'>
        <ChallengesMitigationBox {...sectionProps} />
      </Box>

      <Box className='print-section'>
        <FinancialSummariesBox {...sectionProps} />
      </Box>

      <Box className='print-section'>
        <AdditionalCommentsBox {...sectionProps} />
      </Box>
    </Box>
  );
};

export default ReportPrintContent;
