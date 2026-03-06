import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Grid } from '@mui/material';
import { Checkbox, Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { ExistingProjectIndicatorPayload, useUpdateProjectIndicatorMutation } from 'src/queries/generated/indicators';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { classIdOptions, frequencyOptions, indicatorTypeOptions } from './EditCommonIndicatorModal';
import { metricComponentOptions } from './NewProjectSpecificMetric';

export interface EditProjectIndicatorModalProps {
  onClose: () => void;
  projectIndicator: ExistingProjectIndicatorPayload;
}

export default function EditProjectIndicatorModal(props: EditProjectIndicatorModalProps): JSX.Element {
  const { onClose, projectIndicator } = props;
  const { strings } = useLocalization();

  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const [validate, setValidate] = useState(false);

  const [updateProjectIndicator, updateProjectIndicatorResponse] = useUpdateProjectIndicatorMutation();
  const [record, , , onChangeCallback] = useForm<ExistingProjectIndicatorPayload>(projectIndicator);

  useEffect(() => {
    if (updateProjectIndicatorResponse.isError) {
      snackbar.toastError();
    } else if (updateProjectIndicatorResponse.isSuccess) {
      onClose();
      snackbar.toastSuccess(strings.PROJECT_INDICATOR_SAVED);
    }
  }, [updateProjectIndicatorResponse, snackbar, onClose, strings.PROJECT_INDICATOR_SAVED]);

  const save = useCallback(() => {
    if (!record.name || !record.refId) {
      setValidate(true);
      return;
    }

    void updateProjectIndicator({
      projectId,
      indicatorId: projectIndicator.id,
      updateProjectIndicatorRequestPayload: {
        indicator: record,
      },
    });
  }, [projectId, projectIndicator.id, record, updateProjectIndicator]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.PROJECT_INDICATOR}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
      scrolled
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={12}>
          <TextField
            id='name'
            label={strings.NAME}
            type='text'
            onChange={onChangeCallback('name')}
            value={record.name}
            required
            errorText={validate && !record.name ? strings.REQUIRED_FIELD : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='description'
            label={strings.DESCRIPTION}
            type='textarea'
            onChange={onChangeCallback('description')}
            value={record.description}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='level'
            label={strings.INDICATOR_LEVEL}
            onChange={onChangeCallback('level')}
            options={indicatorTypeOptions()}
            selectedValue={record.level}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='unit'
            label={strings.UNIT}
            type='text'
            maxLength={25}
            onChange={onChangeCallback('unit')}
            value={record.unit}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='refId'
            label={strings.REF_ID}
            type='text'
            onChange={onChangeCallback('refId')}
            value={record.refId}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='category'
            label={strings.CATEGORY}
            onChange={onChangeCallback('category')}
            options={metricComponentOptions()}
            selectedValue={record.category}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='primaryDataSource'
            label={strings.PRIMARY_DATA_SOURCE}
            type='text'
            onChange={onChangeCallback('primaryDataSource')}
            value={record.primaryDataSource}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='tfOwner'
            label={strings.TF_OWNER_REVIEWER}
            type='text'
            onChange={onChangeCallback('tfOwner')}
            value={record.tfOwner}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='classId'
            label={strings.CUMULATIVE_OR_LEVEL}
            onChange={onChangeCallback('classId')}
            options={classIdOptions()}
            selectedValue={record.classId}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='notes'
            label={strings.NOTES}
            type='textarea'
            onChange={onChangeCallback('notes')}
            value={record.notes}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='frequency'
            label={strings.FREQUENCY_OF_REPORTING}
            onChange={onChangeCallback('frequency')}
            options={frequencyOptions()}
            selectedValue={record.frequency}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            disabled={false}
            id='active'
            name='active'
            label={strings.ACTIVE}
            value={record.active}
            onChange={onChangeCallback('active')}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
