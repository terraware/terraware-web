import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

import AcceleratorReportEditForm from './AcceleratorReportEditForm';

const AcceleratorReportEditView = (): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const dispatch = useAppDispatch();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = String(pathParams.reportId);
  const projectId = String(pathParams.projectId);

  const [requestId, setRequestId] = useState<string>('');
  const [report, setReport] = useState<AcceleratorReport>();

  const getReportResult = useAppSelector(selectAcceleratorReport(requestId));

  const reload = useCallback(() => {
    if (projectId) {
      const request = dispatch(requestAcceleratorReport({ projectId, reportId, includeMetrics: true }));
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, reportId]);

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId, setCurrentParticipantProject]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (getReportResult?.status === 'error') {
      return;
    }
    if (getReportResult?.data) {
      setReport(getReportResult.data);
    }
  }, [getReportResult]);

  const year = useMemo(() => {
    return report?.startDate?.split('-')[0];
  }, [report]);

  const reportName = report?.frequency === 'Annual' ? `${year}` : report?.quarter ? `${year}-${report?.quarter}` : '';

  if (!report) {
    return null;
  }

  return (
    <Page
      title={
        <TitleBar
          subtitle={
            currentParticipantProject && getReportResult && activeLocale
              ? `${strings.PROJECT}: ${currentParticipantProject?.name}`
              : ''
          }
          title={activeLocale ? `${strings.REPORT} (${reportName})` : ''}
        />
      }
    >
      <AcceleratorReportEditForm report={report} />
    </Page>
  );
};

export default AcceleratorReportEditView;
