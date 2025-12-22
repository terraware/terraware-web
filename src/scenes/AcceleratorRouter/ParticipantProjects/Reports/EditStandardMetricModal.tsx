import React, { useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import { Checkbox, Confirm, Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import { selectUpdateStandardMetric } from 'src/redux/features/reports/reportsSelectors';
import { requestUpdateStandardMetric } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { StandardMetric } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { metricComponentOptions, metricTypeOptions } from './NewProjectSpecificMetric';

export interface EditStandardMetricModalProps {
  onClose: () => void;
  reload: () => void;
  standardMetric: StandardMetric;
}

export default function EditStandardMetricModal({
  onClose,
  reload,
  standardMetric,
}: EditStandardMetricModalProps): JSX.Element {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [record, , , onChangeCallback] = useForm<StandardMetric>(standardMetric);
  const [validate, setValidate] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const [confirmDialogOpen, , openConfirmDialog, closeConfirmDialog] = useBoolean(false);

  const updateStandardMetricResponse = useAppSelector(selectUpdateStandardMetric(requestId));

  useEffect(() => {
    if (updateStandardMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateStandardMetricResponse?.status === 'success') {
      onClose();
      snackbar.toastSuccess(strings.STANDARD_METRIC_SAVED);
      reload();
    }
  }, [updateStandardMetricResponse, snackbar, onClose, reload]);

  const save = useCallback(() => {
    if (!record.name || !record.reference) {
      setValidate(true);
      return;
    }
    openConfirmDialog();
  }, [record, openConfirmDialog]);

  const confirmSave = useCallback(() => {
    closeConfirmDialog();
    const request = dispatch(requestUpdateStandardMetric({ metric: record }));
    setRequestId(request.requestId);
  }, [dispatch, record, closeConfirmDialog]);

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
      title={strings.STANDARD_METRIC}
    >
      <Confirm
        closeButtonText={strings.CANCEL}
        confirmButtonDisabled={requestId !== '' && updateStandardMetricResponse?.status === 'pending'}
        confirmButtonText={strings.CONFIRM}
        message={strings.EDIT_STANDARD_METRIC_CONFIRMATION}
        onClose={closeConfirmDialog}
        onConfirm={confirmSave}
        open={confirmDialogOpen}
        title={strings.EDIT_STANDARD_METRIC}
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
            id='type'
            label={strings.TYPE}
            onChange={onChangeCallback('type')}
            options={metricTypeOptions()}
            selectedValue={record.type}
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
            errorText={validate && !record.reference ? strings.REQUIRED_FIELD : ''}
            id='reference'
            label={strings.REFERENCE}
            onChange={onChangeCallback('reference')}
            required
            type='text'
            value={record.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            fullWidth
            id='component'
            label={strings.COMPONENT}
            onChange={onChangeCallback('component')}
            options={metricComponentOptions()}
            required
            selectedValue={record.component}
          />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            disabled={false}
            id='isPublishable'
            label={strings.PUBLISH_TO_FUNDER_PORTAL}
            name='isPublishable'
            onChange={onChangeCallback('isPublishable')}
            value={record.isPublishable}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
