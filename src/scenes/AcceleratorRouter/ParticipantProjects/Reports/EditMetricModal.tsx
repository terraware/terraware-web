import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Grid } from '@mui/material';
import { Checkbox, Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { useUpdateProjectMetricMutation } from 'src/queries/generated/reports';
import { ProjectMetric } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { metricComponentOptions, metricTypeOptions } from './NewProjectSpecificMetric';

export interface EditMetricModalProps {
  onClose: () => void;
  projectMetric: ProjectMetric;
}

export default function EditMetricModal(props: EditMetricModalProps): JSX.Element {
  const { onClose, projectMetric } = props;
  const { strings } = useLocalization();

  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const [validate, setValidate] = useState(false);

  const [updateProjectMetric, updateProjectMetricResponse] = useUpdateProjectMetricMutation();
  const [record, , , onChangeCallback] = useForm<ProjectMetric>(projectMetric);

  useEffect(() => {
    if (updateProjectMetricResponse.isError) {
      snackbar.toastError();
    } else if (updateProjectMetricResponse.isSuccess) {
      onClose();
      snackbar.toastSuccess(strings.PROJECT_SPECIFIC_METRIC_SAVED);
    }
  }, [updateProjectMetricResponse, snackbar, onClose, strings.PROJECT_SPECIFIC_METRIC_SAVED]);

  const save = useCallback(() => {
    if (!record.name || !record.reference) {
      setValidate(true);
      return;
    }

    void updateProjectMetric({
      projectId,
      metricId: projectMetric.id,
      updateProjectMetricRequestPayload: {
        metric: record,
      },
    });
  }, [projectId, projectMetric.id, record, updateProjectMetric]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.PROJECT_SPECIFIC_METRIC}
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
            id='name'
            label={strings.DESCRIPTION}
            type='textarea'
            onChange={onChangeCallback('description')}
            value={record.description}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='type'
            label={strings.TYPE}
            onChange={onChangeCallback('type')}
            options={metricTypeOptions()}
            selectedValue={record.type}
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
            id='reference'
            label={strings.REFERENCE}
            type='text'
            onChange={onChangeCallback('reference')}
            value={record.reference}
            required
            errorText={validate && !record.reference ? strings.REQUIRED_FIELD : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='component'
            label={strings.COMPONENT}
            onChange={onChangeCallback('component')}
            options={metricComponentOptions()}
            selectedValue={record.component}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            disabled={false}
            id={'isPublishable'}
            name={'isPublishable'}
            label={strings.PUBLISH_TO_FUNDER_PORTAL}
            value={record.isPublishable}
            onChange={onChangeCallback('isPublishable')}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
