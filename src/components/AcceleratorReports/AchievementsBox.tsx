import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import { useUser } from 'src/providers';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
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

const AchievementsBox = ({ report, projectId, reportId, reload, isConsoleView }: ReportBoxProps) => {
  const { isAllowed } = useUser();
  const [editing, setEditing] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<string[]>(report?.achievements || []);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  useEffect(() => setAchievements(report?.achievements || []), [report?.achievements]);

  useEffect(() => {
    if (achievements.length === 0) {
      addRow();
    }
  }, [achievements]);

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
          achievements: achievements.filter((s) => !!s),
          challenges: report?.challenges || [],
          status: report?.status || 'Not Submitted',
        },
        projectId: Number(projectId),
        reportId: Number(reportId),
      })
    );
    setRequestId(request.requestId);
  }, [dispatch, projectId, reportId, achievements, report]);

  const onCancel = useCallback(() => {
    setEditing(false);
    setAchievements(report?.achievements || []);
  }, [report?.achievements]);

  const updateAchievement = (newAchievement: string, index: number) => {
    setAchievements(achievements.map((ach, i) => (index === i ? newAchievement : ach)));
  };

  const addRow = () => {
    setAchievements(achievements.concat(''));
  };

  return (
    <EditableReportBox
      name={strings.ACHIEVEMENTS}
      canEdit={isAllowed('UPDATE_REPORTS_SETTINGS')}
      editing={editing}
      onEdit={() => setEditing(true)}
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
          editing={editing}
          onRemove={() => setAchievements(achievements.filter((_, i) => index !== i))}
          setAchievement={(ach: string) => updateAchievement(ach, index)}
        />
      ))}
      {editing && (
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
