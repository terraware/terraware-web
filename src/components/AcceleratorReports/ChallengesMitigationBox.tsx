import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ChallengeMitigation } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import { isAcceleratorReport } from './AchievementsBox';
import EditableReportBox from './EditableReportBox';
import { ReportBoxProps } from './ReportBox';

const textAreaStyles = { textarea: { height: '120px' } };

const ChallengeMitigationPlan = ({
  challengeMitigation,
  setChallengeMitigation,
  index,
  includeBorder,
  editing,
  onRemove,
  validateFields,
  noTitle,
}: {
  challengeMitigation: ChallengeMitigation;
  setChallengeMitigation: (challengeMitigation: ChallengeMitigation) => void;
  index: number;
  includeBorder: boolean;
  editing: boolean;
  onRemove: () => void;
  validateFields: boolean;
  noTitle?: boolean;
}) => {
  const theme = useTheme();

  const setChallenge = (value: any) => setChallengeMitigation({ ...challengeMitigation, challenge: value });

  const setMitigation = (value: any) => setChallengeMitigation({ ...challengeMitigation, mitigationPlan: value });

  return (
    <Grid item xs={12} marginBottom={1}>
      {!noTitle && (
        <Box
          sx={{ scrollMarginTop: '50vh' }}
          borderBottom={`1px solid ${theme.palette.TwClrBrdrSecondary}`}
          width={'100%'}
        >
          <Grid container marginBottom={1}>
            <Grid item xs={editing ? 5.75 : 6}>
              <Typography fontWeight={600}>
                {strings.CHALLENGE}
                {editing && ' *'}
              </Typography>
            </Grid>
            <Grid item xs={editing ? 5.75 : 6}>
              <Typography fontWeight={600}>
                {strings.MITIGATION_PLAN}
                {editing && ' *'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      <Grid
        container
        borderBottom={includeBorder && !editing ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''}
        marginBottom={1}
        marginTop={2}
      >
        <Grid item xs={editing ? 5.75 : 6}>
          <Box paddingRight={theme.spacing(2)} marginBottom={1}>
            <Textfield
              type='textarea'
              value={challengeMitigation.challenge}
              id={`challenge-${index}`}
              label={''}
              display={!editing}
              styles={textAreaStyles}
              onChange={setChallenge}
              errorText={
                validateFields && !challengeMitigation.challenge ? strings.TEXT_REQUIRED_BOTH_FIELDS : undefined
              }
              required
              preserveNewlines
            />
          </Box>
        </Grid>
        <Grid item xs={editing ? 5.75 : 6}>
          <Box paddingRight={editing ? 0 : theme.spacing(2)} marginBottom={1}>
            <Textfield
              type='textarea'
              value={challengeMitigation.mitigationPlan}
              id={`mitigation-${index}`}
              label={''}
              display={!editing}
              styles={textAreaStyles}
              onChange={setMitigation}
              errorText={
                validateFields && !challengeMitigation.mitigationPlan ? strings.TEXT_REQUIRED_BOTH_FIELDS : undefined
              }
              required
              preserveNewlines
            />
          </Box>
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
      </Grid>
    </Grid>
  );
};

const ChallengesMitigationBox = (props: ReportBoxProps) => {
  const { report, projectId, reload, isConsoleView, onChange, editing, onEditChange, canEdit, noTitle } = props;
  const [internalEditing, setInternalEditing] = useState<boolean>(false);
  const [challengeMitigations, setChallengeMitigations] = useState<ChallengeMitigation[]>(report?.challenges || []);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const snackbar = useSnackbar();

  const getNonEmptyChallenges = useCallback(() => {
    return challengeMitigations.filter((s) => !!s.challenge || !!s.mitigationPlan);
  }, [challengeMitigations]);

  useEffect(() => setChallengeMitigations(report?.challenges || []), [report?.challenges]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing]);

  useEffect(() => {
    setValidateFields(false);

    if (challengeMitigations.length === 0) {
      addRow();
    }
    const filteredChallenges = getNonEmptyChallenges();
    if (filteredChallenges && JSON.stringify(filteredChallenges) !== JSON.stringify(report?.challenges)) {
      onChange?.(filteredChallenges);
    }
  }, [challengeMitigations]);

  useEffect(() => {
    if (updateReportResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      setInternalEditing(false);
      reload?.();
    }
  }, [updateReportResponse, snackbar]);

  const onSave = useCallback(() => {
    if (isAcceleratorReport(report)) {
      setValidateFields(false);
      const filteredChallenges = getNonEmptyChallenges();
      if (filteredChallenges.some((c) => !c.challenge || !c.mitigationPlan)) {
        setValidateFields(true);
        return;
      }

      const request = dispatch(
        requestReviewAcceleratorReport({
          review: {
            ...report,
            achievements: report?.achievements || [],
            challenges: filteredChallenges,
            status: report?.status || 'Not Submitted',
          },
          projectId: Number(projectId),
          reportId: report?.id || -1,
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, challengeMitigations, report]);

  const onCancel = useCallback(() => {
    setInternalEditing(false);
    setChallengeMitigations(report?.challenges || []);
  }, [report?.challenges]);

  const addRow = useCallback(() => {
    setChallengeMitigations(challengeMitigations.concat({ challenge: '', mitigationPlan: '' }));
  }, [challengeMitigations]);

  const updateChallenge = (newChal: ChallengeMitigation, index: number) => {
    setChallengeMitigations(challengeMitigations.map((chal, i) => (index === i ? newChal : chal)));
  };

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={''}
      includeBorder={false}
      canEdit={!!canEdit}
      editing={isEditing}
      onEdit={() => setInternalEditing(true)}
      onCancel={onCancel}
      onSave={onSave}
      isConsoleView={isConsoleView}
    >
      {challengeMitigations?.map((challenge, index) => (
        <ChallengeMitigationPlan
          challengeMitigation={challenge}
          key={`challenge-mitigation-${index}`}
          index={index}
          includeBorder={index < challengeMitigations.length - 1}
          editing={isEditing}
          onRemove={() => setChallengeMitigations(challengeMitigations.filter((_, i) => index !== i))}
          setChallengeMitigation={(chal: ChallengeMitigation) => updateChallenge(chal, index)}
          validateFields={validateFields}
          noTitle={noTitle}
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

export default ChallengesMitigationBox;
