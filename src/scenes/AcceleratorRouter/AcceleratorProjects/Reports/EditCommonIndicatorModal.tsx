import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import { Checkbox, Confirm, Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import { ExistingCommonIndicatorPayload, useUpdateCommonIndicatorMutation } from 'src/queries/generated/indicators';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { metricComponentOptions, metricTypeOptions } from './NewProjectSpecificMetric';

export interface EditCommonIndicatorModalProps {
  onClose: () => void;
  commonIndicator: ExistingCommonIndicatorPayload;
}

export const indicatorTypeOptions = () => {
  return [
    { label: strings.INDICATOR_TYPE_PROCESS, value: 'Process' },
    { label: strings.METRIC_TYPE_OUTPUT, value: 'Output' },
    { label: strings.METRIC_TYPE_OUTCOME, value: 'Outcome' },
    { label: strings.INDICATOR_TYPE_GOAL, value: 'Goal' },
  ];
};

export const classIdOptions = () => {
  return [
    { label: strings.CUMULATIVE, value: 'Cumulative' },
    { label: strings.LEVEL, value: 'Level' },
  ];
};

export const frequencyOptions = () => {
  return [
    { label: strings.ANNUAL, value: 'Annual' },
    { label: strings.BI_ANNUAL, value: 'Bi-Annual' },
    { label: strings.MRV_CYCLE, value: 'MRV Cycle' },
  ];
};

export default function EditCommonIndicatorModal({
  onClose,
  commonIndicator,
}: EditCommonIndicatorModalProps): JSX.Element {
  const snackbar = useSnackbar();

  const [record, , , onChangeCallback] = useForm<ExistingCommonIndicatorPayload>(commonIndicator);
  const [validate, setValidate] = useState(false);
  const [confirmDialogOpen, , openConfirmDialog, closeConfirmDialog] = useBoolean(false);

  const [updateCommonIndicator, updateCommonIndicatorResponse] = useUpdateCommonIndicatorMutation();

  useEffect(() => {
    if (updateCommonIndicatorResponse.isError) {
      snackbar.toastError();
    } else if (updateCommonIndicatorResponse.isSuccess) {
      onClose();
      snackbar.toastSuccess(strings.COMMON_INDICATOR_SAVED);
    }
  }, [updateCommonIndicatorResponse, snackbar, onClose]);

  const save = useCallback(() => {
    if (!record.name || !record.refId) {
      setValidate(true);
      return;
    }
    openConfirmDialog();
  }, [record, openConfirmDialog]);

  const confirmSave = useCallback(() => {
    closeConfirmDialog();
    void updateCommonIndicator({
      indicatorId: commonIndicator.id,
      updateCommonIndicatorRequestPayload: {
        indicator: record,
      },
    });
  }, [closeConfirmDialog, updateCommonIndicator, commonIndicator.id, record]);

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
      size='medium'
      title={strings.COMMON_INDICATOR}
      scrolled
    >
      <Confirm
        closeButtonText={strings.CANCEL}
        confirmButtonDisabled={updateCommonIndicatorResponse.isLoading}
        confirmButtonText={strings.CONFIRM}
        message={strings.EDIT_COMMON_INDICATOR_CONFIRMATION}
        onClose={closeConfirmDialog}
        onConfirm={confirmSave}
        open={confirmDialogOpen}
        title={strings.EDIT_COMMON_INDICATOR}
      />
      <Grid container spacing={2} textAlign='left'>
        <Grid item xs={12}>
          <TextField
            errorText={validate && !record.name ? strings.REQUIRED_FIELD : ''}
            id='name'
            label={strings.NAME}
            onChange={onChangeCallback('name')}
            required
            type='text'
            value={record.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='description'
            label={strings.DESCRIPTION}
            onChange={onChangeCallback('description')}
            type='textarea'
            value={record.description}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            fullWidth
            id='level'
            label={strings.INDICATOR_LEVEL}
            onChange={onChangeCallback('level')}
            options={metricTypeOptions()}
            selectedValue={record.level}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='unit'
            label={strings.UNIT}
            maxLength={25}
            onChange={onChangeCallback('unit')}
            type='text'
            value={record.unit}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            errorText={validate && !record.refId ? strings.REQUIRED_FIELD : ''}
            id='refId'
            label={strings.REF_ID}
            onChange={onChangeCallback('refId')}
            required
            type='text'
            value={record.refId}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            fullWidth
            id='category'
            label={strings.CATEGORY}
            onChange={onChangeCallback('category')}
            options={metricComponentOptions()}
            required
            selectedValue={record.category}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='primaryDataSource'
            label={strings.PRIMARY_DATA_SOURCE}
            onChange={onChangeCallback('primaryDataSource')}
            type='text'
            value={record.primaryDataSource}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='tfOwner'
            label={strings.TF_OWNER_REVIEWER}
            onChange={onChangeCallback('tfOwner')}
            type='text'
            value={record.tfOwner}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            fullWidth
            id='classId'
            label={strings.CUMULATIVE_OR_LEVEL}
            onChange={onChangeCallback('classId')}
            options={classIdOptions()}
            selectedValue={record.classId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='notes'
            label={strings.NOTES}
            onChange={onChangeCallback('notes')}
            type='textarea'
            value={record.notes}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            fullWidth
            id='frequency'
            label={strings.FREQUENCY_OF_REPORTING}
            onChange={onChangeCallback('frequency')}
            options={frequencyOptions()}
            selectedValue={record.frequency}
          />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            disabled={false}
            id='active'
            label={strings.ACTIVE}
            name='active'
            onChange={onChangeCallback('active')}
            value={record.active}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
