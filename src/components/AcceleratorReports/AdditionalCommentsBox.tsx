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

const AdditionalCommentsBox = (props: ReportBoxProps) => {
  const { report, projectId, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } = props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [additionalComments, setAdditionalComments] = useState<string | undefined>(report?.additionalComments);

  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();
  const snackbar = useSnackbar();

  useEffect(() => setAdditionalComments(report?.additionalComments), [report?.additionalComments]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (additionalComments !== undefined && additionalComments !== report?.additionalComments) {
      onChange?.(additionalComments);
    }
  }, [additionalComments, report?.additionalComments, onChange]);

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
            additionalComments,
            achievements: report?.achievements || [],
            challenges: report?.challenges || [],
            status: report?.status || 'Not Submitted',
          },
        },
      });
    }
  }, [report, reviewReport, projectId, additionalComments]);

  const onCancel = useCallback(() => {
    setAdditionalComments(report?.additionalComments);
    setInternalEditing(false);
  }, [report?.additionalComments, setInternalEditing]);

  const setAdditionalCommentsCallback = useCallback((value: any) => {
    setAdditionalComments(value as string);
  }, []);

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={funderReportView ? '' : strings.ADDITIONAL_COMMENTS}
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
          value={additionalComments}
          id={'additionalComments'}
          label={''}
          display={!isEditing}
          styles={textAreaStyles}
          onChange={setAdditionalCommentsCallback}
          preserveNewlines
          markdown
        />
      </Grid>
    </EditableReportBox>
  );
};

export default AdditionalCommentsBox;
