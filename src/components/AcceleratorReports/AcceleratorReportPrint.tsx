import React, { type JSX, useMemo } from 'react';

import ReportPrint from 'src/components/AcceleratorReports/ReportPrint';
import { getProgressIndicators } from 'src/components/AcceleratorReports/utils';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';

export type AcceleratorReportPrintProps = {
  onClose: () => void;
  projectName?: string;
  reportId: number;
};

const AcceleratorReportPrint = ({ onClose, projectName, reportId }: AcceleratorReportPrintProps): JSX.Element => {
  const { report } = useOneAcceleratorReport(reportId);
  // the same working report prints for Console and for the project, and only Console reads the notes
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const indicators = useMemo(() => getProgressIndicators(report), [report]);

  return (
    <ReportPrint
      indicators={indicators}
      isConsoleView={isAcceleratorRoute}
      onClose={onClose}
      projectName={projectName}
      report={report}
    />
  );
};

export default AcceleratorReportPrint;
