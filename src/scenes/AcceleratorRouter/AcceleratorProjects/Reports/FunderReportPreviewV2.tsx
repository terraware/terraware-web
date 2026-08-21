import React, { type JSX, useMemo } from 'react';
import { useParams } from 'react-router';

import { getFunderVisibleIndicators } from 'src/components/AcceleratorReports/utils';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';

import FunderReportPageV2 from './FunderReportPageV2';

/**
 * The report as it will appear to funders once published, rendered from the working report rather
 * than from the published snapshot, so it also previews reports that have never been published.
 */
const FunderReportPreviewV2 = (): JSX.Element => {
  const { strings } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId: string }>();

  const projectId = Number(pathParams.projectId);
  const reportId = Number(pathParams.reportId);

  const { report } = useOneAcceleratorReport(reportId);

  const indicators = useMemo(() => getFunderVisibleIndicators(report), [report]);

  return (
    <FunderReportPageV2
      banner={strings.FUNDER_REPORT_PREVIEW_WARNING}
      indicators={indicators}
      projectId={projectId}
      report={report}
      reportId={reportId}
      title={strings.REPORT_PREVIEW}
    />
  );
};

export default FunderReportPreviewV2;
