import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import { REPORT_TITLE_STYLE } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEditFields from 'src/components/AcceleratorReports/ReportEditFields';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useUpdateOneAcceleratorReportValuesMutation } from 'src/queries/generated/acceleratorReports';
import { AcceleratorReportPayload } from 'src/queries/generated/reports';
import useSnackbar from 'src/utils/useSnackbar';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ReportInternalComment from './ReportInternalComment';

const ReportEditV2 = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const pathParams = useParams<{ projectId: string; reportId: string }>();

  const projectId = Number(pathParams.projectId);
  const reportId = Number(pathParams.reportId);

  const { report } = useOneAcceleratorReport(reportId);

  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const [updateReport, updateReportResponse] = useUpdateOneAcceleratorReportValuesMutation();

  const goToReport = useCallback(
    () =>
      navigate(
        APP_PATHS.ACCELERATOR_PROJECT_REPORTS_VIEW.replace(':reportId', `${reportId}`).replace(
          ':projectId',
          `${projectId}`
        )
      ),
    [navigate, projectId, reportId]
  );

  const [edits, setEdits] = useState<Partial<AcceleratorReportPayload>>({});
  const [validate, setValidate] = useState(false);

  const record = useMemo(() => (report ? { ...report, ...edits } : undefined), [edits, report]);

  const onChangeCallback = useCallback(
    (id: string) => (value: unknown) => setEdits((previous) => ({ ...previous, [id]: value })),
    []
  );

  const onSave = useCallback(() => {
    if (!record) {
      return;
    }

    setValidate(false);

    const missingPair = record.challenges.some(
      (challenge) =>
        (challenge.challenge && !challenge.mitigationPlan) || (challenge.mitigationPlan && !challenge.challenge)
    );

    if (missingPair) {
      setValidate(true);
      return;
    }

    void updateReport({ reportId, updateAcceleratorReportValuesRequestPayload: record });
  }, [record, reportId, updateReport]);

  useEffect(() => {
    if (updateReportResponse.isError) {
      snackbar.toastError();
    } else if (updateReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      goToReport();
    }
  }, [goToReport, snackbar, strings.CHANGES_SAVED, updateReportResponse.isError, updateReportResponse.isSuccess]);

  const pageCrumbs = useMemo(
    () => [
      ...crumbs,
      {
        name: acceleratorProject?.dealName || project?.name || '',
        to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`),
      },
      {
        name: strings.REPORTS,
        to: APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`),
      },
    ],
    [acceleratorProject?.dealName, crumbs, project?.name, projectId, strings]
  );

  const rightComponent = useMemo(
    () => (
      <Box display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
        <Button
          disabled={updateReportResponse.isLoading}
          id='cancelEditAcceleratorReport'
          label={strings.CANCEL}
          onClick={goToReport}
          priority='secondary'
          size='medium'
          type='passive'
        />

        <Button
          disabled={updateReportResponse.isLoading}
          id='saveEditAcceleratorReport'
          label={strings.SAVE}
          onClick={onSave}
          size='medium'
        />
      </Box>
    ),
    [goToReport, onSave, strings, theme, updateReportResponse.isLoading]
  );

  return (
    <Page
      crumbs={pageCrumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      title={strings.REPORTS}
      titleStyle={{ paddingTop: '16px' }}
    >
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
          <Box alignItems='center' display='flex' justifyContent='space-between' marginBottom={theme.spacing(3)}>
            <Typography sx={REPORT_TITLE_STYLE}>{report ? getReportName(report) : ''}</Typography>

            {report && <AcceleratorReportStatusBadge status={report.status} />}
          </Box>

          {report && <ReportInternalComment projectId={projectId} report={report} />}

          {record && <ReportEditFields onChangeCallback={onChangeCallback} record={record} validate={validate} />}
        </Card>
      </Box>
    </Page>
  );
};

export default ReportEditV2;
