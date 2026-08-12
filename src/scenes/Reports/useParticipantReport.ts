import { useEffect } from 'react';
import { useParams } from 'react-router';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useLazyGetAcceleratorReportQuery } from 'src/queries/generated/acceleratorReports';

const useParticipantReport = () => {
  const { currentAcceleratorProject } = useParticipantData();
  const pathParams = useParams<{ reportId: string }>();

  const reportId = Number(pathParams.reportId);
  const projectId = currentAcceleratorProject?.id;

  const [getReport, getReportResponse] = useLazyGetAcceleratorReportQuery();

  useEffect(() => {
    if (projectId !== undefined) {
      void getReport({ projectId, reportId, includeIndicators: true }, true);
    }
  }, [getReport, projectId, reportId]);

  return {
    getReportResponse,
    projectId,
    report: getReportResponse.currentData?.report,
    reportId,
  };
};

export default useParticipantReport;
