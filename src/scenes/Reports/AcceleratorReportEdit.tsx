import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
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
  const [reports, setReports] = useState<AcceleratorReport[]>();
  const [selectedReport, setSelectedReport] = useState<AcceleratorReport>();

  const reportsResults = useAppSelector(selectListAcceleratorReports(requestId));

  const reload = () => {
    if (projectId) {
      const request = dispatch(requestListAcceleratorReports({ projectId, includeFuture: true, includeMetrics: true }));
      setRequestId(request.requestId);
    }
  };

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId]);

  useEffect(() => {
    reload();
  }, [projectId]);

  useEffect(() => {
    if (reportsResults?.status === 'error') {
      return;
    }
    if (reportsResults?.data) {
      setReports(reportsResults.data);
    }
  }, [reportsResults]);

  useEffect(() => {
    if (reports) {
      const reportSelected = reports.find((report) => report.id.toString() === reportId);
      setSelectedReport(reportSelected);
    }
  }, [reportId, reports]);

  const year = useMemo(() => {
    return selectedReport?.startDate.split('-')[0];
  }, [selectedReport]);

  const reportName =
    selectedReport?.frequency === 'Annual' ? year : selectedReport?.quarter ? `${year}-${selectedReport?.quarter}` : '';

  if (!selectedReport) {
    return null;
  }

  return (
    <Page
      title={
        <TitleBar
          subtitle={
            currentParticipantProject && reportsResults && activeLocale
              ? `${strings.PROJECT}: ${currentParticipantProject?.name}`
              : ''
          }
          title={activeLocale ? `${strings.REPORT} (${reportName})` : ''}
        />
      }
    >
      <AcceleratorReportEditForm report={selectedReport} />
    </Page>
  );
};

export default AcceleratorReportEditView;
