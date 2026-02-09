import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import useBoolean from 'src/hooks/useBoolean';
import { useReviewAcceleratorReportMutation } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

const FinancialSummariesBox = (props: ReportBoxProps) => {
  const { report, projectId, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } = props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [financialSummaries, setFinancialSummaries] = useState<string | undefined>(report?.financialSummaries);
  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();

  const snackbar = useSnackbar();

  useEffect(() => setFinancialSummaries(report?.financialSummaries), [report?.financialSummaries]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (financialSummaries !== undefined && financialSummaries !== report?.financialSummaries) {
      onChange?.(financialSummaries);
    }
  }, [financialSummaries, report?.financialSummaries, onChange]);

  useEffect(() => {
    if (reviewReportResponse.isError) {
      snackbar.toastError();
    } else if (reviewReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      setInternalEditing(false);
    }
  }, [snackbar, setInternalEditing, reviewReportResponse.isError, reviewReportResponse.isSuccess]);

  const onSave = useCallback(() => {
    if (isAcceleratorReport(report)) {
      void reviewReport({
        projectId,
        reportId: report.id,
        reviewAcceleratorReportRequestPayload: {
          review: {
            ...report,
            financialSummaries,
          },
        },
      });
    }
  }, [report, reviewReport, projectId, financialSummaries]);

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
