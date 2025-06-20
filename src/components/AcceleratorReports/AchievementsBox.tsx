import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

const Achievement = ({
  achievement,
  setAchievement,
  index,
  includeBorder,
  editing,
  onRemove,
}: {
  achievement: string;
  setAchievement: (achievement: string) => void;
  index: number;
  includeBorder: boolean;
  editing: boolean;
  onRemove: () => void;
}) => {
  const theme = useTheme();

  return (
    <>
      <Grid
        item
        xs={editing ? 11.5 : 12}
        borderBottom={includeBorder && !editing ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''}
        marginBottom={1}
      >
        <Textfield
          type='textarea'
          value={achievement}
          id={`achievement-${index}`}
          label={''}
          display={!editing}
          styles={textAreaStyles}
          onChange={(value: any) => setAchievement(value)}
          preserveNewlines
        />
      </Grid>
      {editing && (
        <Grid item xs={0.5} display={'flex'} flexDirection={'column'}>
          <Link onClick={onRemove} style={{ height: '100%' }}>
            <Box paddingTop='8px'>
              <Icon name='iconSubtract' size='medium' />
            </Box>
          </Link>
        </Grid>
      )}
    </>
  );
};

const AchievementsBox = (props: ReportBoxProps) => {
  const { report, projectId, reload, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView } =
    props;
  const [internalEditing, setInternalEditing] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<string[]>(report?.achievements || []);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  const getNonEmptyAchievements = useCallback(() => {
    return achievements.filter((s) => !!s);
  }, [achievements]);

  useEffect(() => setAchievements(report?.achievements || []), [report?.achievements]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  const addRow = useCallback(() => {
    setAchievements(achievements.concat(''));
  }, [achievements]);

  useEffect(() => {
    if (achievements.length === 0) {
      addRow();
    }
    const filteredAchievements = getNonEmptyAchievements();
    if (filteredAchievements && JSON.stringify(filteredAchievements) !== JSON.stringify(report?.achievements)) {
      onChange?.(filteredAchievements);
    }
  }, [achievements, addRow, getNonEmptyAchievements, onChange, report?.achievements]);

  useEffect(() => {
    if (updateReportResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      setInternalEditing(false);
      reload?.();
    }
  }, [updateReportResponse, snackbar, reload]);

  const onSave = useCallback(() => {
    if (isAcceleratorReport(report)) {
      const request = dispatch(
        requestReviewAcceleratorReport({
          review: {
            ...report,
            achievements: getNonEmptyAchievements(),
            challenges: report?.challenges || [],
            status: report?.status || 'Not Submitted',
          },
          projectId: Number(projectId),
          reportId: report?.id || -1,
        })
      );
      setRequestId(request.requestId);
    }
  }, [report, dispatch, getNonEmptyAchievements, projectId]);

  const onCancel = useCallback(() => {
    setInternalEditing(false);
    setAchievements(report?.achievements || []);
  }, [report?.achievements]);

  const updateAchievement = (newAchievement: string, index: number) => {
    setAchievements(achievements.map((ach, i) => (index === i ? newAchievement : ach)));
  };

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={funderReportView ? '' : strings.ACHIEVEMENTS}
      canEdit={!!canEdit}
      editing={isEditing}
      onEdit={() => setInternalEditing(true)}
      onCancel={onCancel}
      onSave={onSave}
      isConsoleView={isConsoleView}
    >
      {achievements.map((achievement, index) => (
        <Achievement
          achievement={achievement}
          key={`achievement-${index}`}
          index={index}
          includeBorder={index < achievements.length - 1}
          editing={isEditing}
          onRemove={() => setAchievements(achievements.filter((_, i) => index !== i))}
          setAchievement={(ach: string) => updateAchievement(ach, index)}
        />
      ))}
      {isEditing && (
        <Button
          onClick={addRow}
          icon={'iconAdd'}
          type='productive'
          priority='ghost'
          size='medium'
          label={strings.EDITABLE_TABLE_ADD_ROW}
        />
      )}
    </EditableReportBox>
  );
};

export default AchievementsBox;
