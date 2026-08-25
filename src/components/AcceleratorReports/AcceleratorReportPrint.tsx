import React, { type JSX, useMemo } from 'react';

import ReportPrint from 'src/components/AcceleratorReports/ReportPrint';
import { getProgressIndicators } from 'src/components/AcceleratorReports/utils';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';

export type AcceleratorReportPrintProps = {
  onClose: () => void;
  /**
   * The console shows the deal name and the participant shows the project name, so the caller
   * supplies it — the same split `useExportReportCsv` makes.
   */
  projectName?: string;
  reportId: number;
};

/**
 * The working report, as printed for the console and for participants. Fetches, because the report
 * tabs list their reports without indicators.
 */
const AcceleratorReportPrint = ({ onClose, projectName, reportId }: AcceleratorReportPrintProps): JSX.Element => {
  const { report } = useOneAcceleratorReport(reportId);

  const indicators = useMemo(() => getProgressIndicators(report), [report]);

  return <ReportPrint indicators={indicators} onClose={onClose} projectName={projectName} report={report} />;
};

export default AcceleratorReportPrint;
