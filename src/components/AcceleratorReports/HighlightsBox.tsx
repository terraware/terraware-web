import React, { useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { useUser } from 'src/providers';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import EditableReportBox from './EditableReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

type HighlightsBoxProps = {
  report?: AcceleratorReport;
  projectId: string;
  reportId: string;
  reload: () => void;
};

const HighlightsBox = ({ report, projectId, reportId, reload }: HighlightsBoxProps) => {
  const { isAllowed } = useUser();
  const [editing, setEditing] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<string | undefined>(report?.highlights);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  useEffect(() => setHighlights(report?.highlights), [report?.highlights]);

  useEffect(() => {
    if (updateReportResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      setEditing(false);
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

  return (
    <EditableReportBox
      name={strings.HIGHLIGHTS}
      canEdit={isAllowed('UPDATE_REPORTS_SETTINGS')}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      onSave={onSave}
    >
      <Grid item xs={12}>
        <Textfield
          type='textarea'
          value={highlights}
          id={'highlights'}
          label={''}
          display={!editing}
          styles={textAreaStyles}
          onChange={(value: any) => setHighlights(value)}
          preserveNewlines
        />
      </Grid>
    </EditableReportBox>
  );
};

export default HighlightsBox;
