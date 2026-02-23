import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Confirm, Dropdown } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Checkbox from 'src/components/common/Checkbox';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import useBoolean from 'src/hooks/useBoolean';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useCreateStandardMetricMutation } from 'src/queries/generated/reportMetrics';
import { CreateStandardMetricRequestPayload } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { metricComponentOptions, metricTypeOptions } from './NewProjectSpecificMetric';

export default function NewStandardMetric(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = String(pathParams.projectId);

  const [confirmDialogOpen, , openConfirmDialog, closeConfirmDialog] = useBoolean(false);
  const [validate, setValidate] = useState(false);

  const [createStandardMetric, createStandardMetricResponse] = useCreateStandardMetricMutation();

  const goToProjectReports = useCallback(() => {
    navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId)}?tab=settings`);
  }, [navigate, projectId]);

  useEffect(() => {
    if (createStandardMetricResponse.isError) {
      snackbar.toastError();
    } else if (createStandardMetricResponse.isSuccess) {
      snackbar.toastSuccess(strings.STANDARD_METRIC_SAVED);
      goToProjectReports();
    }
  }, [createStandardMetricResponse, snackbar, goToProjectReports, strings.STANDARD_METRIC_SAVED]);

  const [newMetric, , , onChangeCallback] = useForm<CreateStandardMetricRequestPayload['metric']>({
    component: 'Biodiversity',
    isPublishable: true,
    name: '',
    reference: '',
    type: 'Activity',
  });

  const saveNewMetric = useCallback(() => {
    if (!newMetric.name || !newMetric.reference) {
      setValidate(true);
      return;
    }
    openConfirmDialog();
  }, [newMetric, openConfirmDialog]);

  const confirmSave = useCallback(() => {
    closeConfirmDialog();
    void createStandardMetric({
      metric: newMetric,
    });
  }, [closeConfirmDialog, createStandardMetric, newMetric]);

  return (
    <>
      <Confirm
        closeButtonText={strings.CANCEL}
        confirmButtonDisabled={createStandardMetricResponse.isLoading}
        confirmButtonText={strings.CONFIRM}
        message={strings.ADD_STANDARD_METRIC_CONFIRMATION}
        onClose={closeConfirmDialog}
        onConfirm={confirmSave}
        open={confirmDialogOpen}
        title={strings.ADD_STANDARD_METRIC}
      />
      <Page contentStyle={{ display: 'flex', flexDirection: 'column' }} title={strings.REPORTS}>
        <PageForm
          cancelID='cancelNewMetric'
          onCancel={goToProjectReports}
          onSave={saveNewMetric}
          saveID='saveNewMetric'
        >
          <Container
            maxWidth={false}
            sx={{
              display: 'flex',
              margin: '0 auto',
              paddingLeft: theme.spacing(isMobile ? 0 : 4),
              paddingRight: theme.spacing(isMobile ? 0 : 4),
              paddingTop: theme.spacing(5),
              width: isMobile ? '100%' : '700px',
            }}
          >
            <Card style={{ width: '568px', margin: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography fontSize='20px' fontWeight={600}>
                    {strings.STANDARD_METRICS}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    errorText={validate && !newMetric.name ? strings.REQUIRED_FIELD : ''}
                    id='name'
                    label={strings.NAME}
                    onChange={onChangeCallback('name')}
                    required
                    type='text'
                    value={newMetric.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id='description'
                    label={strings.DESCRIPTION}
                    onChange={onChangeCallback('description')}
                    type='textarea'
                    value={newMetric.description}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Dropdown
                    fullWidth
                    id='type'
                    label={strings.TYPE}
                    onChange={onChangeCallback('type')}
                    options={metricTypeOptions()}
                    selectedValue={newMetric.type}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    errorText={validate && !newMetric.reference ? strings.REQUIRED_FIELD : ''}
                    id='reference'
                    label={strings.REFERENCE}
                    onChange={onChangeCallback('reference')}
                    required
                    type='text'
                    value={newMetric.reference}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id='unit'
                    label={strings.UNIT}
                    maxLength={25}
                    onChange={onChangeCallback('unit')}
                    type='text'
                    value={newMetric.unit}
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
                    selectedValue={newMetric.component}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Checkbox
                    disabled={false}
                    id='isPublishable'
                    label={strings.PUBLISH_TO_FUNDER_PORTAL}
                    name='isPublishable'
                    onChange={onChangeCallback('isPublishable')}
                    value={newMetric.isPublishable}
                  />
                </Grid>
              </Grid>
            </Card>
          </Container>
        </PageForm>
      </Page>
    </>
  );
}
