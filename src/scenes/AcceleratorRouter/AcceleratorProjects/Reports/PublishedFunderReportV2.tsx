import React, { type JSX, useMemo } from 'react';
import { useParams } from 'react-router';

import { getDateDisplayValue } from '@terraware/web-components/utils';

import ReportExportMenu from 'src/components/AcceleratorReports/ReportExportMenu';
import useExportReportCsv from 'src/components/AcceleratorReports/useExportReportCsv';
import { getPublishedProgressIndicators } from 'src/components/AcceleratorReports/utils';
import { useLocalization } from 'src/providers';
import { useGetPublishedReportQuery } from 'src/queries/generated/publishedReports';

import FunderReportPageV2 from './FunderReportPageV2';

const PublishedFunderReportV2 = (): JSX.Element => {
  const { strings } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId: string }>();

  const projectId = Number(pathParams.projectId);
  const reportId = Number(pathParams.reportId);

  const { currentData: getPublishedReportData, error } = useGetPublishedReportQuery(reportId);
  const { exportFunderReport } = useExportReportCsv();

  const report = getPublishedReportData?.report;

  const indicators = useMemo(() => getPublishedProgressIndicators(report), [report]);

  const isUnpublished = error !== undefined && 'status' in error && error.status === 404;

  return (
    <FunderReportPageV2
      banner={isUnpublished ? strings.REPORT_NOT_PUBLISHED_YET : strings.PUBLISHED_REPORT_CONSOLE_WARNING}
      indicators={indicators}
      note={
        report
          ? strings
              .formatString(strings.FUNDER_REPORT_LAST_PUBLISHED, getDateDisplayValue(report.publishedTime))
              .toString()
          : undefined
      }
      projectId={projectId}
      report={report}
      reportId={reportId}
      rightComponent={
        <ReportExportMenu
          disabled={report === undefined}
          onExport={() => void exportFunderReport({ projectId, reportId })}
        />
      }
      title={strings.PUBLISHED_FUNDER_REPORT}
    />
  );
};

export default PublishedFunderReportV2;
