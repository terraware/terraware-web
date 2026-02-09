import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Checkbox from 'src/components/common/Checkbox';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useCreateProjectMetricMutation } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { NewMetric } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';

export const metricTypeOptions = () => {
  return [
    { label: strings.METRIC_TYPE_ACTIVITY, value: 'Activity' },
    { label: strings.METRIC_TYPE_OUTPUT, value: 'Output' },
    { label: strings.METRIC_TYPE_OUTCOME, value: 'Outcome' },
    { label: strings.METRIC_TYPE_IMPACT, value: 'Impact' },
  ];
};

export const metricComponentOptions = () => {
  return [
    { label: strings.COMMUNITY, value: 'Community' },
    { label: strings.PROJECT_OBJECTIVES, value: 'Project Objectives' },
    { label: strings.CLIMATE, value: 'Climate' },
    { label: strings.BIODIVERSITY, value: 'Biodiversity' },
  ];
};

export default function NewProjectSpecificMetric(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const [validate, setValidate] = useState(false);

  const goToProjectReports = useCallback(() => {
    navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId.toString())}?tab=settings`);
  }, [navigate, projectId]);

  const { isMobile } = useDeviceInfo();

  const [createProjectMetric, createProjectMetricResponse] = useCreateProjectMetricMutation();

  useEffect(() => {
    if (createProjectMetricResponse.isSuccess) {
      goToProjectReports();
    }
  }, [createProjectMetricResponse, goToProjectReports]);

  const [newMetric, , , onChangeCallback] = useForm<NewMetric>({
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

    void createProjectMetric({
      projectId,
      createProjectMetricRequestPayload: {
        metric: newMetric,
      },
    });
  }, [createProjectMetric, newMetric, projectId]);

  return (
    <Page title={strings.REPORTS} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PageForm cancelID='cancelNewMetric' saveID='saveNewMetric' onCancel={goToProjectReports} onSave={saveNewMetric}>
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
                  onChange={onChangeCallback('name')}
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
                  id={'isPublishable'}
                  name={'isPublishable'}
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
  );
}
