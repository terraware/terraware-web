import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import useBoolean from 'src/hooks/useBoolean';
import { useReviewAcceleratorReportMutation } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { ChallengeMitigation, isAcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

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
  funderReportView,
  validate,
}: {
  challengeMitigation: ChallengeMitigation;
  setChallengeMitigation: (challengeMitigation: ChallengeMitigation) => void;
  index: number;
  includeBorder: boolean;
  editing: boolean;
  onRemove: () => void;
  validateFields: boolean;
  funderReportView?: boolean;
  validate?: boolean;
}) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const setChallenge = useCallback(
    (value: any) => setChallengeMitigation({ ...challengeMitigation, challenge: value }),
    [challengeMitigation, setChallengeMitigation]
  );

  const setMitigation = useCallback(
    (value: any) => setChallengeMitigation({ ...challengeMitigation, mitigationPlan: value }),
    [challengeMitigation, setChallengeMitigation]
  );

  return (
    <Grid item xs={12} marginBottom={1}>
      {!(funderReportView && !isMobile) && (
        <Box
          sx={{ scrollMarginTop: '50vh' }}
          borderBottom={funderReportView ? 'none' : `1px solid ${theme.palette.TwClrBrdrSecondary}`}
          width={'100%'}
        >
          <Grid container marginBottom={1}>
            <Grid item xs={funderReportView && isMobile ? 12 : editing ? 5.75 : 6}>
              <Typography fontWeight={600} fontSize={funderReportView ? '20px' : '16px'}>
                {strings.CHALLENGE}
                {editing && ' *'}
              </Typography>
            </Grid>
            {!(funderReportView && isMobile) && (
              <Grid item xs={editing ? 5.75 : 6}>
                <Typography fontWeight={600}>
                  {strings.MITIGATION_PLAN}
                  {editing && ' *'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      <Grid
        container
        borderBottom={includeBorder && !editing ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''}
        marginBottom={1}
        marginTop={2}
      >
        <Grid item xs={funderReportView && isMobile ? 12 : editing ? 5.75 : 6}>
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
                (validateFields || validate) && !challengeMitigation.challenge
                  ? strings.TEXT_REQUIRED_BOTH_FIELDS
                  : undefined
              }
              required
              preserveNewlines
              markdown
            />
          </Box>
        </Grid>
        {funderReportView && isMobile && (
          <Grid item xs={12}>
            <Typography fontWeight={600} marginBottom={2} paddingTop={1} fontSize={funderReportView ? '20px' : '16px'}>
              {strings.MITIGATION_PLAN}
            </Typography>
          </Grid>
        )}
        <Grid item xs={funderReportView && isMobile ? 12 : editing ? 5.75 : 6}>
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
                (validateFields || validate) && !challengeMitigation.mitigationPlan
                  ? strings.TEXT_REQUIRED_BOTH_FIELDS
                  : undefined
              }
              required
              preserveNewlines
              markdown
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
  const { report, projectId, isConsoleView, onChange, editing, onEditChange, canEdit, funderReportView, validate } =
    props;
  const [internalEditing, setInternalEditing, setInternalEditingTrue] = useBoolean(false);
  const [challengeMitigations, setChallengeMitigations] = useState<ChallengeMitigation[]>(report?.challenges || []);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();
  const snackbar = useSnackbar();

  const { isMobile } = useDeviceInfo();
  const nonEmptyChallenges = useMemo(() => {
    return challengeMitigations.filter((s) => !!s.challenge || !!s.mitigationPlan);
  }, [challengeMitigations]);

  const areFilteredChallengesDifferent = useMemo(() => {
    return nonEmptyChallenges.length > 0 && JSON.stringify(nonEmptyChallenges) !== JSON.stringify(report?.challenges);
  }, [report?.challenges, nonEmptyChallenges]);

  useEffect(() => {
    if (!editing) {
      setChallengeMitigations(report?.challenges || []);
    }
  }, [editing, report?.challenges]);

  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  const addRow = useCallback(() => {
    setChallengeMitigations(challengeMitigations.concat({ challenge: '', mitigationPlan: '' }));
  }, [challengeMitigations]);

  useEffect(() => {
    setValidateFields(false);

    if (challengeMitigations.length === 0) {
      addRow();
    }
    if (onChange) {
      if (areFilteredChallengesDifferent) {
        // only call onChange if the non-empty challenges are different, but call it with all to include the empty
        // challenges; otherwise deleting characters can cause rows to disappear
        onChange(challengeMitigations);
      }
    }
  }, [addRow, areFilteredChallengesDifferent, challengeMitigations, onChange]);

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
      setValidateFields(false);
      if (nonEmptyChallenges.some((c) => !c.challenge || !c.mitigationPlan)) {
        setValidateFields(true);
        return;
      }

      void reviewReport({
        projectId,
        reportId: report.id,
        reviewAcceleratorReportRequestPayload: {
          review: {
            ...report,
            achievements: report?.achievements || [],
            challenges: nonEmptyChallenges,
            status: report?.status || 'Not Submitted',
          },
        },
      });
    }
  }, [report, nonEmptyChallenges, reviewReport, projectId]);

  const onCancel = useCallback(() => {
    setInternalEditing(false);
    setChallengeMitigations(report?.challenges || []);
  }, [report?.challenges, setInternalEditing]);

  const updateChallenge = useCallback(
    (index: number) => (newChal: ChallengeMitigation) => {
      setChallengeMitigations((_challengeMitigations) =>
        _challengeMitigations.map((chal, i) => (index === i ? newChal : chal))
      );
    },
    []
  );

  const deleteChallenge = useCallback(
    (index: number) => () => {
      setChallengeMitigations((_challengeMitigations) => _challengeMitigations.filter((_, i) => index !== i));
    },
    []
  );

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  return (
    <EditableReportBox
      name={''}
      canEdit={!!canEdit}
      editing={isEditing}
      onEdit={setInternalEditingTrue}
      onCancel={onCancel}
      onSave={onSave}
      isConsoleView={isConsoleView}
      includeBorder={!funderReportView}
    >
      {funderReportView && !isMobile && (
        <Box width={'100%'}>
          <Grid container marginBottom={1}>
            <Grid item xs={6}>
              <Typography fontWeight={600} fontSize={'20px'}>
                {strings.CHALLENGE}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight={600} fontSize={'20px'}>
                {strings.MITIGATION_PLAN}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      {challengeMitigations?.map((challenge, index) => (
        <ChallengeMitigationPlan
          challengeMitigation={challenge}
          key={`challenge-mitigation-${index}`}
          index={index}
          includeBorder={index < challengeMitigations.length - 1}
          editing={isEditing}
          onRemove={deleteChallenge(index)}
          setChallengeMitigation={updateChallenge(index)}
          validateFields={validateFields}
          funderReportView={funderReportView}
          validate={validate}
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
