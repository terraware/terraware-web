import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Checkbox from 'src/components/common/Checkbox';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import { selectCreateProjectMetric } from 'src/redux/features/reports/reportsSelectors';
import { requestCreateProjectMetric, requestProjectReportConfig } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { NewMetric } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';

export const metricTypeOptions = [
  { label: strings.METRIC_TYPE_ACTIVITY, value: 'Activity' },
  { label: strings.METRIC_TYPE_OUTPUT, value: 'Output' },
  { label: strings.METRIC_TYPE_OUTCOME, value: 'Outcome' },
  { label: strings.METRIC_TYPE_IMPACT, value: 'Impact' },
];

export const metricComponentOptions = [
  { label: strings.COMMUNITY, value: 'Community' },
  { label: strings.PROJECT_OBJECTIVES, value: 'Project Objectives' },
  { label: strings.CLIMATE, value: 'Climate' },
  { label: strings.BIODIVERSITY, value: 'Biodiversity' },
];

export default function NewProjectSpecificMetric(): JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = String(pathParams.projectId);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const createProjectMetricResponse = useAppSelector(selectCreateProjectMetric(requestId));
  const [validate, setValidate] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(requestProjectReportConfig(projectId));
    }
  }, [projectId]);

  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    if (createProjectMetricResponse?.status === 'success') {
      goToProjectReports();
    }
  }, [createProjectMetricResponse]);

  const goToProjectReports = () => {
    navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId)}?tab=settings`);
  };

  const [newMetric, , onChange] = useForm<NewMetric>({
    component: 'Biodiversity',
    name: '',
    reference: '',
    type: 'Activity',
    isPublishable: true,
  });

  const saveNewMetric = () => {
    if (!newMetric.name || !newMetric.reference) {
      setValidate(true);
      return;
    }
    const request = dispatch(requestCreateProjectMetric({ metric: newMetric, projectId: projectId }));
    setRequestId(request.requestId);
  };

  return (
    <Page title={strings.REPORTS} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PageForm
        cancelID='cancelNewMetric'
        saveID='saveNewMetric'
        onCancel={goToProjectReports}
        onSave={() => saveNewMetric()}
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
                <Typography fontSize={'20px'} fontWeight={600}>
                  {strings.PROJECT_SPECIFIC_METRICS}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='name'
                  label={strings.NAME}
                  type='text'
                  onChange={(value) => onChange('name', value)}
                  value={newMetric.name}
                  required
                  errorText={validate && !newMetric.name ? strings.REQUIRED_FIELD : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='name'
                  label={strings.DESCRIPTION}
                  type='textarea'
                  onChange={(value) => onChange('description', value)}
                  value={newMetric.description}
                />
              </Grid>
              <Grid item xs={12}>
                <Dropdown
                  id='type'
                  label={strings.TYPE}
                  onChange={(newValue: string) => onChange('type', newValue)}
                  options={metricTypeOptions}
                  selectedValue={newMetric.type}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='reference'
                  label={strings.REFERENCE}
                  type='text'
                  onChange={(value) => onChange('reference', value)}
                  value={newMetric.reference}
                  required
                  errorText={validate && !newMetric.reference ? strings.REQUIRED_FIELD : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <Dropdown
                  id='component'
                  label={strings.COMPONENT}
                  onChange={(newValue: string) => onChange('component', newValue)}
                  options={metricComponentOptions}
                  selectedValue={newMetric.component}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Checkbox
                  disabled={false}
                  id={'publishMetric'}
                  name={'publish-metric'}
                  label={strings.PUBLISH_METRIC}
                  value={false}
                  onChange={() => true}
                />
              </Grid>
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </Page>
  );
}
