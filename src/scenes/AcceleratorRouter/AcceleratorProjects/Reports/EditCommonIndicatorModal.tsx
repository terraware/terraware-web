import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import { useLocalization } from 'src/providers';
import {
  ExistingCommonIndicatorPayload,
  useUpdateProjectCommonIndicatorMutation,
} from 'src/queries/generated/indicators';
import { useGetProjectQuery } from 'src/queries/generated/projects';
import strings, { ILocalizedStrings } from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export const indicatorComponentOptions = () => {
  return [
    { label: strings.COMMUNITY, value: 'Community' },
    { label: strings.PROJECT_OBJECTIVES, value: 'Project Objectives' },
    { label: strings.CLIMATE, value: 'Climate' },
    { label: strings.BIODIVERSITY, value: 'Biodiversity' },
  ];
};

export interface EditCommonIndicatorModalProps {
  onClose: () => void;
  commonIndicator: ExistingCommonIndicatorPayload;
}

export const indicatorTypeOptions = () => {
  return [
    { label: strings.INDICATOR_TYPE_PROCESS, value: 'Process' },
    { label: strings.INDICATOR_TYPE_OUTPUT, value: 'Output' },
    { label: strings.INDICATOR_TYPE_OUTCOME, value: 'Outcome' },
    { label: strings.INDICATOR_TYPE_GOAL, value: 'Goal' },
  ];
};

export const classIdOptions = () => {
  return [
    { label: strings.NOT_CUMULATIVE, value: 'Not Cumulative' },
    { label: strings.LIFETIME_CUMULATIVE, value: 'Lifetime Cumulative' },
    { label: strings.YEARLY_CUMULATIVE, value: 'Yearly Cumulative' },
  ];
};

export const frequencyOptions = () => {
  return [
    { label: strings.ANNUAL, value: 'Annual' },
    { label: strings.BI_ANNUAL, value: 'Bi-Annual' },
    { label: strings.MRV_CYCLE, value: 'MRV Cycle' },
    { label: strings.QUARTERLY, value: 'Quarterly' },
  ];
};

/** The fields a common indicator shares with every project, paired with the label to name them by. */
const sharedFields: { key: keyof ExistingCommonIndicatorPayload; label: (strings: ILocalizedStrings) => string }[] = [
  { key: 'name', label: (s) => s.INDICATOR_NAME },
  { key: 'description', label: (s) => s.DEFINITION },
  { key: 'unit', label: (s) => s.UNIT },
  { key: 'classId', label: (s) => s.IS_CUMULATIVE },
  { key: 'precision', label: (s) => s.IS_DECIMAL },
  { key: 'category', label: (s) => s.CATEGORY },
  { key: 'level', label: (s) => s.INDICATOR_LEVEL },
  { key: 'frequency', label: (s) => s.FREQUENCY_OF_REPORTING },
  { key: 'tfOwner', label: (s) => s.TF_OWNER_REVIEWER },
];

export default function EditCommonIndicatorModal({
  onClose,
  commonIndicator,
}: EditCommonIndicatorModalProps): JSX.Element {
  const snackbar = useSnackbar();
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { data: projectResponse } = useGetProjectQuery(projectId);
  const projectName = projectResponse?.project.name ?? '';

  const [record, , , onChangeCallback] = useForm<ExistingCommonIndicatorPayload>(commonIndicator);
  const [validate, setValidate] = useState(false);
  const [confirmDialogOpen, , openConfirmDialog, closeConfirmDialog] = useBoolean(false);
  const { activeLocale } = useLocalization();

  const [updateCommonIndicator, updateCommonIndicatorResponse] = useUpdateProjectCommonIndicatorMutation();

  useEffect(() => {
    if (updateCommonIndicatorResponse.isError && activeLocale) {
      snackbar.toastError();
    } else if (updateCommonIndicatorResponse.isSuccess) {
      onClose();
      snackbar.toastSuccess(strings.COMMON_INDICATOR_SAVED);
    }
  }, [updateCommonIndicatorResponse, snackbar, onClose, activeLocale]);

  const changedSharedFields = useMemo(
    () => sharedFields.filter(({ key }) => (record[key] ?? '') !== (commonIndicator[key] ?? '')),
    [record, commonIndicator]
  );

  const submit = useCallback(() => {
    void updateCommonIndicator({
      projectId,
      indicatorId: commonIndicator.id,
      updateCommonIndicatorRequestPayload: {
        indicator: { ...record, refId: record.refId || undefined },
      },
    });
  }, [updateCommonIndicator, projectId, commonIndicator.id, record]);

  const save = useCallback(() => {
    if (!record.name) {
      setValidate(true);
      return;
    }
    // Project-level edits only touch this project, so they need no warning.
    if (changedSharedFields.length === 0) {
      submit();
      return;
    }
    openConfirmDialog();
  }, [record, changedSharedFields, submit, openConfirmDialog]);

  const confirmSave = useCallback(() => {
    closeConfirmDialog();
    submit();
  }, [closeConfirmDialog, submit]);

  return (
    <DialogBox
      middleButtons={[
        <Button
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button id='save' key='button-2' label={strings.SAVE} onClick={save} />,
      ]}
      onClose={onClose}
      open={true}
      size='x-large'
      title={strings.EDIT_INDICATOR}
      scrolled
    >
      {confirmDialogOpen && (
        <DialogBox
          middleButtons={[
            <Button
              id='confirm-close'
              key='button-1'
              label={strings.CANCEL}
              onClick={closeConfirmDialog}
              priority='secondary'
              type='passive'
            />,
            <Button
              disabled={updateCommonIndicatorResponse.isLoading}
              id='confirm-submit'
              key='button-2'
              label={strings.SAVE_FOR_ALL_PROJECTS}
              onClick={confirmSave}
            />,
          ]}
          onClose={closeConfirmDialog}
          open={true}
          scrolled
          size='large'
          title={strings.THIS_CHANGE_APPLIES_TO_ALL_PROJECTS}
        >
          <Box textAlign='left'>
            <Typography>
              {strings.formatString(
                changedSharedFields.length === 1
                  ? strings.COMMON_INDICATOR_SHARED_FIELDS_CHANGED
                  : strings.COMMON_INDICATOR_SHARED_FIELDS_CHANGED_PLURAL,
                commonIndicator.name
              )}
            </Typography>
            <ul>
              {changedSharedFields.map(({ key, label }) => (
                <li key={key}>
                  <Typography>{label(strings)}</Typography>
                </li>
              ))}
            </ul>
            <Typography>{strings.formatString(strings.SAVING_UPDATES_ALL_PROJECTS, projectName)}</Typography>
          </Box>
        </DialogBox>
      )}
      <Box
        borderRadius={theme.spacing(1)}
        marginBottom={theme.spacing(3)}
        padding={theme.spacing(3)}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        textAlign='left'
      >
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PROJECT_LEVEL_FIELDS}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingBottom={theme.spacing(2)}>
          {strings.formatString(strings.PROJECT_LEVEL_FIELDS_DESCRIPTION, <b>{projectName}</b>)}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              id='refId'
              label={strings.REF_ID}
              onChange={onChangeCallback('refId')}
              type='text'
              value={record.refId}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              id='primaryDataSource'
              label={strings.PRIMARY_DATA_SOURCE}
              onChange={onChangeCallback('primaryDataSource')}
              type='text'
              value={record.primaryDataSource}
            />
          </Grid>
          <Grid size={6}>
            <Checkbox
              id='active'
              label={strings.ACTIVE}
              name='active'
              onChange={onChangeCallback('active')}
              value={record.active}
            />
          </Grid>
          <Grid size={6}>
            <Checkbox
              id='isPublishable'
              label={strings.PUBLISH_TO_FUNDER_PORTAL}
              name='isPublishable'
              onChange={onChangeCallback('isPublishable')}
              value={record.isPublishable}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              id='notes'
              label={strings.NOTES}
              onChange={onChangeCallback('notes')}
              type='textarea'
              value={record.notes}
            />
          </Grid>
        </Grid>
      </Box>

      <Box
        border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        borderRadius={theme.spacing(1)}
        padding={theme.spacing(3)}
        textAlign='left'
      >
        <Typography fontSize='20px' fontWeight={600}>
          {strings.SHARED_FIELDS_ACROSS_ALL_PROJECTS}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingBottom={theme.spacing(2)}>
          {strings.SHARED_FIELDS_APPLY_TO_ALL_PROJECTS}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              errorText={validate && !record.name ? strings.REQUIRED_FIELD : ''}
              id='name'
              label={strings.INDICATOR_NAME}
              onChange={onChangeCallback('name')}
              required
              type='text'
              value={record.name}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              id='description'
              label={strings.DEFINITION}
              onChange={onChangeCallback('description')}
              type='textarea'
              value={record.description}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              id='unit'
              label={strings.UNIT}
              maxLength={25}
              onChange={onChangeCallback('unit')}
              type='text'
              value={record.unit}
            />
          </Grid>
          <Grid size={4}>
            <Dropdown
              fullWidth
              id='classId'
              label={strings.IS_CUMULATIVE}
              onChange={onChangeCallback('classId')}
              options={classIdOptions()}
              selectedValue={record.classId}
            />
          </Grid>
          <Grid size={4} alignContent='center'>
            <Checkbox
              id='isDecimal'
              label={strings.IS_DECIMAL}
              name='isDecimal'
              onChange={(value) => onChangeCallback('precision')(value ? 2 : 0)}
              value={record.precision === 2}
            />
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={4}>
            <Dropdown
              fullWidth
              id='category'
              label={strings.CATEGORY}
              onChange={onChangeCallback('category')}
              options={indicatorComponentOptions()}
              required
              selectedValue={record.category}
            />
          </Grid>
          <Grid size={4}>
            <Dropdown
              fullWidth
              id='level'
              label={strings.INDICATOR_LEVEL}
              onChange={onChangeCallback('level')}
              options={indicatorTypeOptions()}
              selectedValue={record.level}
            />
          </Grid>
          <Grid size={4}>
            <Dropdown
              fullWidth
              id='frequency'
              label={strings.FREQUENCY_OF_REPORTING}
              onChange={onChangeCallback('frequency')}
              options={frequencyOptions()}
              selectedValue={record.frequency}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              id='tfOwner'
              label={strings.TF_OWNER_REVIEWER}
              onChange={onChangeCallback('tfOwner')}
              type='text'
              value={record.tfOwner}
            />
          </Grid>
        </Grid>
      </Box>
    </DialogBox>
  );
}
