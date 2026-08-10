import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import { REPORT_TITLE_STYLE } from 'src/components/AcceleratorReports/ReportDropdown';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';
import { useUpdateOneAcceleratorReportValuesMutation } from 'src/queries/generated/acceleratorReports';
import useSnackbar from 'src/utils/useSnackbar';

const AcceleratorReportEditV2 = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const pathParams = useParams<{ reportId: string }>();
  const reportId = Number(pathParams.reportId);

  const { report } = useOneAcceleratorReport(reportId);

  const { goToAcceleratorReport } = useNavigateTo();
  const snackbar = useSnackbar();
  const [updateReport, updateReportResponse] = useUpdateOneAcceleratorReportValuesMutation();

  const goToReport = useCallback(() => goToAcceleratorReport(reportId), [goToAcceleratorReport, reportId]);

  // the form is reachable by typing the path, and a report stops being editable once it is submitted
  useEffect(() => {
    if (report && report.status !== 'Not Submitted' && report.status !== 'Needs Update') {
      goToReport();
    }
  }, [goToReport, report]);

  const onSave = useCallback(() => {
    if (report) {
      void updateReport({ reportId, updateAcceleratorReportValuesRequestPayload: report });
    }
  }, [report, reportId, updateReport]);

  useEffect(() => {
    if (updateReportResponse.isError) {
      snackbar.toastError();
    } else if (updateReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      goToReport();
    }
  }, [goToReport, snackbar, strings.CHANGES_SAVED, updateReportResponse.isError, updateReportResponse.isSuccess]);

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
    <Page hierarchicalCrumbs={false} rightComponent={rightComponent} title={strings.REPORTS}>
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
          <Box alignItems='center' display='flex' justifyContent='space-between' marginBottom={theme.spacing(3)}>
            <Typography sx={REPORT_TITLE_STYLE}>{report ? getReportName(report) : ''}</Typography>

            {report && <AcceleratorReportStatusBadge status={report.status} />}
          </Box>
        </Card>
      </Box>
    </Page>
  );
};

export default AcceleratorReportEditV2;
