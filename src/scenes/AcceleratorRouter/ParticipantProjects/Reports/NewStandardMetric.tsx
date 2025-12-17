import React, { useCallback, useEffect, useState } from 'react';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ConfirmModal from 'src/components/Application/ConfirmModal';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Checkbox from 'src/components/common/Checkbox';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import useBoolean from 'src/hooks/useBoolean';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { selectCreateStandardMetric } from 'src/redux/features/reports/reportsSelectors';
import { requestCreateStandardMetric } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CreateStandardMetricRequestPayload } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';

import { metricComponentOptions, metricTypeOptions } from './NewProjectSpecificMetric';

export default function NewStandardMetric(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const createStandardMetricResponse = useAppSelector(selectCreateStandardMetric(requestId));
  const [validate, setValidate] = useState(false);
  const [confirmDialogOpen, , openConfirmDialog, closeConfirmDialog] = useBoolean(false);

  const goToReports = useCallback(() => {
    // Go back to the previous page (which should be the ReportsSettings page)
    navigate(-1);
  }, [navigate]);

  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    if (createStandardMetricResponse?.status === 'success') {
      goToReports();
    }
  }, [createStandardMetricResponse, goToReports]);

  const [newMetric, , , onChangeCallback] = useForm<CreateStandardMetricRequestPayload['metric']>({
    component: 'Biodiversity',
    name: '',
    reference: '',
    type: 'Activity',
    isPublishable: true,
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
    const request = dispatch(requestCreateStandardMetric({ metric: newMetric }));
    setRequestId(request.requestId);
  }, [dispatch, newMetric, closeConfirmDialog]);

  return (
    <>
      <ConfirmModal
        body={strings.ADD_STANDARD_METRIC_CONFIRMATION}
        onClose={closeConfirmDialog}
        onConfirm={confirmSave}
        open={confirmDialogOpen}
        title={strings.ADD_STANDARD_METRIC}
      />
      <Page title={strings.REPORTS} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
        <PageForm cancelID='cancelNewMetric' saveID='saveNewMetric' onCancel={goToReports} onSave={saveNewMetric}>
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
                    id='name'
                    label={strings.NAME}
                    type='text'
                    onChange={onChangeCallback('name')}
                    value={newMetric.name}
                    required
                    errorText={validate && !newMetric.name ? strings.REQUIRED_FIELD : ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id='description'
                    label={strings.DESCRIPTION}
                    type='textarea'
                    onChange={onChangeCallback('description')}
                    value={newMetric.description}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Dropdown
                    id='type'
                    label={strings.TYPE}
                    onChange={onChangeCallback('type')}
                    options={metricTypeOptions()}
                    selectedValue={newMetric.type}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id='reference'
                    label={strings.REFERENCE}
                    type='text'
                    onChange={onChangeCallback('reference')}
                    value={newMetric.reference}
                    required
                    errorText={validate && !newMetric.reference ? strings.REQUIRED_FIELD : ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id='unit'
                    label={strings.UNIT}
                    type='text'
                    maxLength={25}
                    onChange={onChangeCallback('unit')}
                    value={newMetric.unit}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Dropdown
                    id='component'
                    label={strings.COMPONENT}
                    onChange={onChangeCallback('component')}
                    options={metricComponentOptions()}
                    selectedValue={newMetric.component}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Checkbox
                    disabled={false}
                    id='isPublishable'
                    name='isPublishable'
                    label={strings.PUBLISH_TO_FUNDER_PORTAL}
                    value={newMetric.isPublishable}
                    onChange={onChangeCallback('isPublishable')}
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
