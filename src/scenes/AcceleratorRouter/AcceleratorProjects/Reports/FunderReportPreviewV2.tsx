import React, { type JSX, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import FunderReportContentV2 from 'src/components/AcceleratorReports/FunderReportContentV2';
import { getFunderVisibleIndicators } from 'src/components/AcceleratorReports/IndicatorProgressSection';
import { REPORT_TITLE_STYLE } from 'src/components/AcceleratorReports/ReportDropdown';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';

/**
 * The report as it will appear to funders once published, rendered from the working report rather
 * than from the published snapshot, so it also previews reports that have never been published.
 */
const FunderReportPreviewV2 = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const pathParams = useParams<{ projectId: string; reportId: string }>();

  const projectId = Number(pathParams.projectId);
  const reportId = Number(pathParams.reportId);

  const { report } = useOneAcceleratorReport(reportId);

  const indicators = useMemo(() => getFunderVisibleIndicators(report), [report]);

  const reportName = report ? getReportName(report) : '';

  const pageCrumbs = useMemo<Crumb[]>(
    () => [
      ...crumbs,
      {
        name: acceleratorProject?.dealName || project?.name || '',
        to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`),
      },
      {
        name: strings.REPORTS,
        to: APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`),
      },
      // the report the preview was opened from, so there is a way back to it
      ...(reportName
        ? [
            {
              name: reportName,
              to: APP_PATHS.ACCELERATOR_PROJECT_REPORTS_VIEW.replace(':projectId', `${projectId}`).replace(
                ':reportId',
                `${reportId}`
              ),
            },
          ]
        : []),
    ],
    [acceleratorProject?.dealName, crumbs, project?.name, projectId, reportId, reportName, strings]
  );

  return (
    <Page
      crumbs={pageCrumbs}
      hierarchicalCrumbs={false}
      title={strings.REPORT_PREVIEW}
      titleStyle={{ paddingTop: '16px' }}
    >
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Box marginTop={theme.spacing(3)} width={'100%'}>
          <Message body={strings.FUNDER_REPORT_PREVIEW_WARNING} priority='info' type='page' />
        </Box>

        <FunderReportContentV2
          header={<Typography sx={REPORT_TITLE_STYLE}>{reportName}</Typography>}
          indicators={indicators}
          projectId={projectId}
          report={report}
        />
      </Box>
    </Page>
  );
};

export default FunderReportPreviewV2;
