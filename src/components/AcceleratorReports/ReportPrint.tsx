import React, { type JSX } from 'react';

import ReportPrintContent from 'src/components/AcceleratorReports/ReportPrintContent';
import { type ProgressIndicator, getReportName, reportExportPrefix } from 'src/components/AcceleratorReports/utils';
import PrintWindow from 'src/components/common/PrintWindow';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';

export type ReportPrintProps = {
  funderReportView?: boolean;
  /**
   * Which indicators to print. The caller decides, because that is where the audience lives: the
   * whole set for the working report, the publishable ones for a funder preview, and whatever the
   * published payload happens to carry for a funder.
   */
  indicators: ProgressIndicator[];
  isConsoleView?: boolean;
  onClose: () => void;
  projectName?: string;
  report?: AcceleratorReportPayload | PublishedReportPayload;
};

/** Opens the print window for a report the caller has already loaded. */
const ReportPrint = ({
  funderReportView,
  indicators,
  isConsoleView,
  onClose,
  projectName,
  report,
}: ReportPrintProps): JSX.Element => {
  const { strings } = useLocalization();
  // the print window's title is what the browser offers as the PDF filename
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const prefix = reportExportPrefix(isAcceleratorRoute, !!funderReportView);
  const title = report
    ? `${prefix}${[projectName, getReportName(report)].filter(Boolean).join(' ')}`
    : `${prefix}${strings.REPORT}`;

  return (
    <PrintWindow onClose={onClose} ready={report !== undefined} title={title}>
      {report && (
        <ReportPrintContent
          funderReportView={funderReportView}
          indicators={indicators}
          isConsoleView={isConsoleView}
          projectId={report.projectId}
          projectName={projectName}
          report={report}
        />
      )}
    </PrintWindow>
  );
};

export default ReportPrint;
