import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Grid } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { selectUpdateProjectMetric } from 'src/redux/features/reports/reportsSelectors';
import { requestUpdateProjectMetric } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ProjectMetric } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { metricComponentOptions, metricTypeOptions } from './NewProjectSpecificMetric';

export interface EditMetricModalProps {
  onClose: () => void;
  reload: () => void;
  projectMetric: ProjectMetric;
}

export default function EditMetricModal(props: EditMetricModalProps): JSX.Element {
  const { onClose, projectMetric, reload } = props;
  const [requestId, setRequestId] = useState<string>('');
  const dispatch = useAppDispatch();
  const updateProjectMetricResponse = useAppSelector(selectUpdateProjectMetric(requestId));
  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const [record, , onChange] = useForm<ProjectMetric>(projectMetric);

  useEffect(() => {
    if (updateProjectMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateProjectMetricResponse?.status === 'success') {
      onClose();
      snackbar.toastSuccess(strings.PROJECT_SPECIFIC_METRIC_SAVED);
      reload();
    }
  }, [updateProjectMetricResponse, snackbar]);

  const save = () => {
    const request = dispatch(
      requestUpdateProjectMetric({
        metric: record,
        projectId: projectId,
        metricId: projectMetric.id,
      })
    );
    setRequestId(request.requestId);
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.PROJECT_SPECIFIC_METRIC}
      size='large'
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
      <Grid container textAlign={'left'}>
        <Grid item xs={12}>
          <TextField
            id='name'
            label={strings.NAME}
            type='text'
            onChange={(value) => onChange('name', value)}
            value={record.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='name'
            label={strings.DESCRIPTION}
            type='textarea'
            onChange={(value) => onChange('description', value)}
            value={record.description}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='type'
            label={strings.TYPE}
            onChange={(newValue: string) => onChange('type', newValue)}
            options={metricTypeOptions}
            selectedValue={record.type}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='reference'
            label={strings.REFERENCE}
            type='text'
            onChange={(value) => onChange('reference', value)}
            value={record.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='component'
            label={strings.COMPONENT}
            onChange={(newValue: string) => onChange('component', newValue)}
            options={metricComponentOptions}
            selectedValue={record.component}
            fullWidth
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
