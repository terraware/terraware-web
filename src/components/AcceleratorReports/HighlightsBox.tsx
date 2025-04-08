import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { useUser } from 'src/providers';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

const HighlightsBox = (props: ReportBoxProps) => {
  const { report, projectId, reportId, reload, isConsoleView, onChange, editing } = props;
  const { isAllowed } = useUser();
  const [internalEditing, setInternalEditing] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<string | undefined>(report?.highlights);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  useEffect(() => setHighlights(report?.highlights), [report?.highlights]);

  useEffect(() => {
    if (highlights && highlights !== report?.highlights) {
      onChange?.(highlights);
    }
  }, [highlights]);

  useEffect(() => {
    if (updateReportResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      setInternalEditing(false);
      reload();
    }
  }, [updateReportResponse, snackbar]);

  const onSave = useCallback(() => {
    const request = dispatch(
      requestReviewAcceleratorReport({
        review: {
          ...report,
          highlights: highlights,
          achievements: report?.achievements || [],
          challenges: report?.challenges || [],
          status: report?.status || 'Not Submitted',
        },
        projectId: Number(projectId),
        reportId: Number(reportId),
      })
    );
    setRequestId(request.requestId);
  }, [dispatch, projectId, reportId, highlights, report]);

  const onCancel = useCallback(() => {
    setHighlights(report?.highlights);
    setInternalEditing(false);
  }, [highlights, report?.highlights]);

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={strings.HIGHLIGHTS}
      canEdit={isAllowed('UPDATE_REPORTS_SETTINGS')}
      editing={isEditing}
      onEdit={() => setInternalEditing(true)}
      onCancel={onCancel}
      onSave={onSave}
      isConsoleView={isConsoleView}
    >
      <Grid item xs={12}>
        <Textfield
          type='textarea'
          value={highlights}
          id={'highlights'}
          label={''}
          display={!isEditing}
          styles={textAreaStyles}
          onChange={(value: any) => setHighlights(value)}
          preserveNewlines
        />
      </Grid>
    </EditableReportBox>
  );
};

export default HighlightsBox;
