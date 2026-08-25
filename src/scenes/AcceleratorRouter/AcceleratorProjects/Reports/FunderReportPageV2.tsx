import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import FunderReportContentV2 from 'src/components/AcceleratorReports/FunderReportContentV2';
import { REPORT_TITLE_STYLE } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportExportMenu from 'src/components/AcceleratorReports/ReportExportMenu';
import ReportPrint from 'src/components/AcceleratorReports/ReportPrint';
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
  /** omitted where the page has nothing to export; printing is offered on every one of them */
  onExport?: () => void;
  projectId: number;
  report?: AcceleratorReportPayload | PublishedReportPayload;
  reportId: number;
  title: string;
};

const FunderReportPageV2 = ({
  banner,
  indicators,
  note,
  onExport,
  projectId,
  report,
  reportId,
  title,
}: FunderReportPageV2Props): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();

  const [printing, setPrinting] = useState(false);

  const startPrinting = useCallback(() => setPrinting(true), []);
  const stopPrinting = useCallback(() => setPrinting(false), []);

  const reportName = report ? getReportName(report) : '';
  const projectName = acceleratorProject?.dealName || project?.name;

  const pageCrumbs = useMemo<Crumb[]>(
    () => [
      ...crumbs,
      {
        name: projectName || '',
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
    [crumbs, projectId, projectName, reportId, reportName, strings]
  );

  return (
    <Page
      crumbs={pageCrumbs}
      hierarchicalCrumbs={false}
      rightComponent={<ReportExportMenu disabled={report === undefined} onExport={onExport} onPrint={startPrinting} />}
      title={title}
      titleStyle={{ paddingTop: '16px' }}
    >
      {printing && (
        <ReportPrint indicators={indicators} onClose={stopPrinting} projectName={projectName} report={report} />
      )}

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
