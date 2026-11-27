import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Divider, Grid, useTheme } from '@mui/material';
import { Checkbox, Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import {
  ExistingProjectIndicatorPayload,
  useUpdateProjectSpecificIndicatorMutation,
} from 'src/queries/generated/indicators';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import {
  classIdOptions,
  frequencyOptions,
  indicatorComponentOptions,
  indicatorTypeOptions,
} from './EditCommonIndicatorModal';

export interface EditProjectIndicatorModalProps {
  onClose: () => void;
  projectIndicator: ExistingProjectIndicatorPayload;
}

export default function EditProjectIndicatorModal(props: EditProjectIndicatorModalProps): JSX.Element {
  const { onClose, projectIndicator } = props;
  const { strings } = useLocalization();
  const theme = useTheme();

  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const [validate, setValidate] = useState(false);

  const [updateProjectIndicator, updateProjectIndicatorResponse] = useUpdateProjectSpecificIndicatorMutation();
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
      title={strings.EDIT_INDICATOR}
      size='x-large'
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
      <Box
        border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        borderRadius={theme.spacing(1)}
        padding={theme.spacing(3)}
        textAlign='left'
      >
        <Grid container spacing={2}>
          <Grid size={8}>
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
          <Grid size={4}>
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
              required
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
          <Grid size={4}>
            <Checkbox
              id='active'
              label={strings.ACTIVE}
              name='active'
              onChange={onChangeCallback('active')}
              value={record.active}
            />
          </Grid>
          <Grid size={8}>
            <Checkbox
              id='isPublishable'
              label={strings.PUBLISH_TO_FUNDER_PORTAL}
              name='isPublishable'
              onChange={onChangeCallback('isPublishable')}
              value={record.isPublishable}
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
              required
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
              id='primaryDataSource'
              label={strings.PRIMARY_DATA_SOURCE}
              onChange={onChangeCallback('primaryDataSource')}
              type='text'
              value={record.primaryDataSource}
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
    </DialogBox>
  );
}
