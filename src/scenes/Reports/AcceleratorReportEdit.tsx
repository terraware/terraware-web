import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useGetAcceleratorReportQuery } from 'src/queries/generated/reports';
import useSnackbar from 'src/utils/useSnackbar';

import AcceleratorReportEditForm from './AcceleratorReportEditForm';

const AcceleratorReportEditView = (): JSX.Element | null => {
  const { activeLocale, strings } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = Number(pathParams.reportId);
  const projectId = Number(pathParams.projectId);

  const getReportResults = useGetAcceleratorReportQuery({ reportId, projectId, includeMetrics: true });
  const snackbar = useSnackbar();

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId, setCurrentParticipantProject]);

  useEffect(() => {
    if (getReportResults.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getReportResults.isError, snackbar, strings.GENERIC_ERROR]);

  const report = useMemo(() => getReportResults.data?.report, [getReportResults.data?.report]);

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
          subtitle={currentParticipantProject ? `${strings.PROJECT}: ${currentParticipantProject?.name}` : ''}
          title={activeLocale ? `${strings.REPORT} (${reportName})` : ''}
        />
      }
    >
      <AcceleratorReportEditForm report={report} />
    </Page>
  );
};

export default AcceleratorReportEditView;
