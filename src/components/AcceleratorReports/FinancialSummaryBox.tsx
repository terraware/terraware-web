import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import useBoolean from 'src/hooks/useBoolean';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

const FinancialSummariesBox = (props: ReportBoxProps) => {
  const { report, projectId, reload, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } =
    props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [financialSummaries, setFinancialSummaries] = useState<string | undefined>(report?.financialSummaries);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  useEffect(() => setFinancialSummaries(report?.financialSummaries), [report?.financialSummaries]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (financialSummaries !== undefined && financialSummaries !== report?.financialSummaries) {
      onChange?.(financialSummaries);
    }
  }, [financialSummaries, report?.financialSummaries, onChange]);

  useEffect(() => {
    if (updateReportResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      setInternalEditing(false);
      reload?.();
    }
  }, [updateReportResponse, snackbar, reload, setInternalEditing]);

  const onSave = useCallback(() => {
    if (isAcceleratorReport(report)) {
      const request = dispatch(
        requestReviewAcceleratorReport({
          review: {
            ...report,
            financialSummaries,
          },
          projectId: Number(projectId),
          reportId: report?.id || -1,
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, financialSummaries, report]);

  const onCancel = useCallback(() => {
    setFinancialSummaries(report?.financialSummaries);
    setInternalEditing(false);
  }, [report?.financialSummaries, setInternalEditing]);

  const setFinancialSummariesCallback = useCallback((value: any) => {
    setFinancialSummaries(value as string);
  }, []);

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={funderReportView ? '' : strings.FINANCIAL_SUMMARIES}
      canEdit={!!canEdit}
      editing={isEditing}
      onEdit={setInternalEditingTrue}
      onCancel={onCancel}
      onSave={onSave}
      isConsoleView={isConsoleView}
      includeBorder={!funderReportView}
    >
      <Grid item xs={12}>
        <Textfield
          type='textarea'
          value={financialSummaries}
          id={'financialSummaries'}
          label={''}
          display={!isEditing}
          styles={textAreaStyles}
          onChange={setFinancialSummariesCallback}
          preserveNewlines
          markdown
        />
      </Grid>
    </EditableReportBox>
  );
};

export default FinancialSummariesBox;
