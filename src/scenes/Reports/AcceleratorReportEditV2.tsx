import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import { REPORT_TITLE_STYLE } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEditFields from 'src/components/AcceleratorReports/ReportEditFields';
import { getReportName, toUpdateReportValuesPayload } from 'src/components/AcceleratorReports/utils';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import useSnackbar from 'src/utils/useSnackbar';

const AcceleratorReportEditV2 = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const pathParams = useParams<{ reportId: string }>();
  const reportId = Number(pathParams.reportId);

  const { report } = useOneAcceleratorReport(reportId);

  const { goToAcceleratorReport } = useNavigateTo();
  const snackbar = useSnackbar();
  const { isLoading, updateReportValues, updateReportValuesResponse } = useAcceleratorReportActions(reportId);

  const goToReport = useCallback(() => goToAcceleratorReport(reportId), [goToAcceleratorReport, reportId]);

  // the form is reachable by typing the path, and a report stops being editable once it is submitted
  useEffect(() => {
    if (report && report.status !== 'Not Submitted' && report.status !== 'Needs Update') {
      goToReport();
    }
  }, [goToReport, report]);

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

    void updateReportValues(toUpdateReportValuesPayload(record));
  }, [record, updateReportValues]);

  useEffect(() => {
    if (updateReportValuesResponse.isError) {
      snackbar.toastError();
      updateReportValuesResponse.reset();
    } else if (updateReportValuesResponse.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      goToReport();
      updateReportValuesResponse.reset();
    }
  }, [goToReport, snackbar, strings.CHANGES_SAVED, updateReportValuesResponse]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
        <Button
          disabled={isLoading}
          id='cancelEditAcceleratorReport'
          label={strings.CANCEL}
          onClick={goToReport}
          priority='secondary'
          size='medium'
          type='passive'
        />

        <Button
          disabled={isLoading}
          id='saveEditAcceleratorReport'
          label={strings.SAVE}
          onClick={onSave}
          size='medium'
        />
      </Box>
    ),
    [goToReport, isLoading, onSave, strings, theme]
  );

  return (
    <Page hierarchicalCrumbs={false} rightComponent={rightComponent} title={strings.REPORTS}>
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
          <Box alignItems='center' display='flex' justifyContent='space-between' marginBottom={theme.spacing(3)}>
            <Typography sx={REPORT_TITLE_STYLE}>{report ? getReportName(report) : ''}</Typography>

            {report && <AcceleratorReportStatusBadge status={report.status} />}
          </Box>

          {record && <ReportEditFields onChangeCallback={onChangeCallback} record={record} validate={validate} />}
        </Card>
      </Box>
    </Page>
  );
};

export default AcceleratorReportEditV2;
