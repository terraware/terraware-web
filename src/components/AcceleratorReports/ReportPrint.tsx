import React, { type JSX } from 'react';

import ReportPrintContent from 'src/components/AcceleratorReports/ReportPrintContent';
import { type ProgressIndicator, getReportName } from 'src/components/AcceleratorReports/utils';
import PrintWindow from 'src/components/common/PrintWindow';
import { useLocalization } from 'src/providers';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';

export type ReportPrintProps = {
  /**
   * Which indicators to print. The caller decides, because that is where the audience lives: the
   * whole set for the working report, the publishable ones for a funder preview, and whatever the
   * published payload happens to carry for a funder.
   */
  indicators: ProgressIndicator[];
  onClose: () => void;
  projectName?: string;
  report?: AcceleratorReportPayload | PublishedReportPayload;
};

/** Opens the print window for a report the caller has already loaded. */
const ReportPrint = ({ indicators, onClose, projectName, report }: ReportPrintProps): JSX.Element => {
  const { strings } = useLocalization();

  const title = report ? [projectName, getReportName(report)].filter(Boolean).join(' ') : strings.REPORT;

  return (
    <PrintWindow onClose={onClose} ready={report !== undefined} title={title}>
      {report && (
        <ReportPrintContent
          indicators={indicators}
          projectId={report.projectId}
          projectName={projectName}
          report={report}
        />
      )}
    </PrintWindow>
  );
};

export default ReportPrint;
