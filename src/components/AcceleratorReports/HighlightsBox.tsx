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

const HighlightsBox = (props: ReportBoxProps) => {
  const { report, projectId, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } = props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [highlights, setHighlights] = useState<string | undefined>(report?.highlights);
  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();

  const snackbar = useSnackbar();

  useEffect(() => setHighlights(report?.highlights), [report?.highlights]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (highlights !== undefined && highlights !== report?.highlights) {
      onChange?.(highlights);
    }
  }, [highlights, report?.highlights, onChange]);

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
            highlights,
          },
        },
      });
    }
  }, [report, reviewReport, projectId, highlights]);

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
