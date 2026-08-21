import React, { type JSX, type ReactNode, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import FunderReportContentV2 from 'src/components/AcceleratorReports/FunderReportContentV2';
import { REPORT_TITLE_STYLE } from 'src/components/AcceleratorReports/ReportDropdown';
import { ProgressIndicator, getReportName } from 'src/components/AcceleratorReports/utils';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';

type FunderReportPageV2Props = {
  /** shown on the top of the page */
  banner: string;
  indicators: ProgressIndicator[];
  /** shown under the report name, e.g. when the report was last published */
  note?: string;
  projectId: number;
  report?: AcceleratorReportPayload | PublishedReportPayload;
  reportId: number;
  rightComponent?: ReactNode;
  title: string;
};

const FunderReportPageV2 = ({
  banner,
  indicators,
  note,
  projectId,
  report,
  reportId,
  rightComponent,
  title,
}: FunderReportPageV2Props): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();

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
      // the report this view was opened from, so there is a way back to it
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
      rightComponent={rightComponent}
      title={title}
      titleStyle={{ paddingTop: '16px' }}
    >
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Box marginTop={theme.spacing(3)} width={'100%'}>
          <Message body={banner} priority='info' type='page' />
        </Box>

        {report && (
          <FunderReportContentV2
            header={
              <>
                <Typography sx={REPORT_TITLE_STYLE}>{reportName}</Typography>

                {note && (
                  <Typography color={theme.palette.TwClrTxt} fontSize='14px' lineHeight='20px'>
                    {note}
                  </Typography>
                )}
              </>
            }
            indicators={indicators}
            projectId={projectId}
            report={report}
          />
        )}
      </Box>
    </Page>
  );
};

export default FunderReportPageV2;
