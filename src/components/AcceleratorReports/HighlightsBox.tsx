import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import isEnabled from 'src/features';
import useBoolean from 'src/hooks/useBoolean';
import { useReviewAcceleratorReportMutation } from 'src/queries/generated/acceleratorReports';
import strings from 'src/strings';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

const COLLAPSED_MAX_HEIGHT = 120;

const HighlightsBox = (props: ReportBoxProps) => {
  const { report, projectId, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView, printMode } =
    props;
  const newReportTabEnabled = isEnabled('Report Updates July 2026');
  const theme = useTheme();
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

  const truncateConfig = useMemo(
    () =>
      newReportTabEnabled
        ? {
            maxHeight: COLLAPSED_MAX_HEIGHT,
            showLessText: strings.SHOW_LESS,
            showMoreText: strings.SHOW_MORE,
          }
        : undefined,
    [newReportTabEnabled]
  );

  return (
    <EditableReportBox
      name={funderReportView ? '' : strings.HIGHLIGHTS}
      canEdit={!!canEdit}
      editing={isEditing}
      onEdit={setInternalEditingTrue}
      onCancel={onCancel}
      onSave={onSave}
      isConsoleView={isConsoleView}
      includeBorder={!newReportTabEnabled && !funderReportView}
    >
      <Grid item xs={12}>
        {newReportTabEnabled && !isEditing && !highlights ? (
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
            {strings.NO_HIGHLIGHTS_ADDED}
          </Typography>
        ) : (
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
            truncateConfig={isEditing || printMode ? undefined : truncateConfig}
          />
        )}
      </Grid>
    </EditableReportBox>
  );
};

export default HighlightsBox;
