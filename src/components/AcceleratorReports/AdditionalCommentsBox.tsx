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

const AdditionalCommentsBox = (props: ReportBoxProps) => {
  const { report, projectId, reload, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } =
    props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [additionalComments, setAdditionalComments] = useState<string | undefined>(report?.additionalComments);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  useEffect(() => setAdditionalComments(report?.additionalComments), [report?.additionalComments]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (additionalComments !== undefined && additionalComments !== report?.additionalComments) {
      onChange?.(additionalComments);
    }
  }, [additionalComments, report?.additionalComments, onChange]);

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
            additionalComments,
            achievements: report?.achievements || [],
            challenges: report?.challenges || [],
            status: report?.status || 'Not Submitted',
          },
          projectId: Number(projectId),
          reportId: report?.id || -1,
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, additionalComments, report]);

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
      includeBorder={false}
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
