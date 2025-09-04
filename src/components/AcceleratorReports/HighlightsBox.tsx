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

const HighlightsBox = (props: ReportBoxProps) => {
  const { report, projectId, reload, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } =
    props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [highlights, setHighlights] = useState<string | undefined>(report?.highlights);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  useEffect(() => setHighlights(report?.highlights), [report?.highlights]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (highlights !== undefined && highlights !== report?.highlights) {
      onChange?.(highlights);
    }
  }, [highlights, report?.highlights, onChange]);

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
            highlights,
          },
          projectId: Number(projectId),
          reportId: report?.id || -1,
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, highlights, report]);

  const onCancel = useCallback(() => {
    setHighlights(report?.highlights);
    setInternalEditing(false);
  }, [report?.highlights, setInternalEditing]);

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  const setHighlightsCallback = useCallback((value: any) => {
    setHighlights(value as string);
  }, []);

  return (
    <EditableReportBox
      name={funderReportView ? '' : strings.HIGHLIGHTS}
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
          value={highlights}
          id={'highlights'}
          label={''}
          display={!isEditing}
          styles={textAreaStyles}
          onChange={setHighlightsCallback}
          preserveNewlines
          markdown
        />
      </Grid>
    </EditableReportBox>
  );
};

export default HighlightsBox;
