import React, { type JSX, useEffect, useMemo } from 'react';

import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import useSnackbar from 'src/utils/useSnackbar';

import AcceleratorReportEditForm from './AcceleratorReportEditForm';
import useParticipantReport from './useParticipantReport';

const AcceleratorReportEditView = (): JSX.Element | null => {
  const { strings } = useLocalization();
  const { currentAcceleratorProject } = useParticipantData();

  const { getReportResponse, report } = useParticipantReport();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (getReportResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [getReportResponse.isError, snackbar, strings.GENERIC_ERROR]);

  const year = useMemo(() => {
    return report?.startDate?.split('-')[0];
  }, [report]);

  const reportName = report?.quarter ? `${year}-${report?.quarter}` : year ? `${year}` : '';

  if (!report) {
    return null;
  }

  return (
    <Page
      title={
        <TitleBar
          subtitle={currentAcceleratorProject ? `${strings.PROJECT}: ${currentAcceleratorProject?.name}` : ''}
          title={`${strings.REPORT} (${reportName})`}
        />
      }
    >
      <AcceleratorReportEditForm report={report} />
    </Page>
  );
};

export default AcceleratorReportEditView;
