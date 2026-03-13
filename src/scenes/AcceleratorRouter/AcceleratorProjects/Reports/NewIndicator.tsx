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
import { useLocalization } from 'src/providers';
import {
  NewIndicatorPayload,
  useCreateCommonIndicatorMutation,
  useCreateProjectIndicatorMutation,
} from 'src/queries/generated/indicators';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { classIdOptions, frequencyOptions, indicatorTypeOptions } from './EditCommonIndicatorModal';
import { metricComponentOptions } from './NewProjectSpecificMetric';

type IndicatorKind = 'common' | 'project';

export default function NewIndicator(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const [validate, setValidate] = useState(false);
  const [indicatorKind, setIndicatorKind] = useState<IndicatorKind>('common');

  const goToProjectReports = useCallback(() => {
    navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId.toString())}?tab=settings`);
  }, [navigate, projectId]);

  const [createCommonIndicator, createCommonIndicatorResponse] = useCreateCommonIndicatorMutation();
  const [createProjectIndicator, createProjectIndicatorResponse] = useCreateProjectIndicatorMutation();

  useEffect(() => {
    if (createCommonIndicatorResponse.isError || createProjectIndicatorResponse.isError) {
      snackbar.toastError();
    } else if (createCommonIndicatorResponse.isSuccess) {
      snackbar.toastSuccess(strings.COMMON_INDICATOR_SAVED);
      goToProjectReports();
    } else if (createProjectIndicatorResponse.isSuccess) {
      snackbar.toastSuccess(strings.PROJECT_INDICATOR_SAVED);
      goToProjectReports();
    }
  }, [
    createCommonIndicatorResponse.isError,
    createCommonIndicatorResponse.isSuccess,
    createProjectIndicatorResponse.isError,
    createProjectIndicatorResponse.isSuccess,
    goToProjectReports,
    snackbar,
    strings.COMMON_INDICATOR_SAVED,
    strings.PROJECT_INDICATOR_SAVED,
  ]);

  const [newIndicator, , , onChangeCallback] = useForm<NewIndicatorPayload>({
    active: true,
    category: 'Biodiversity',
    classId: 'Level',
    isPublishable: true,
    level: 'Goal',
    name: '',
    precision: 0,
    refId: '',
  });

  const kindOptions = [
    { label: strings.COMMON_INDICATOR, value: 'common' as IndicatorKind },
    { label: strings.PROJECT_SPECIFIC, value: 'project' as IndicatorKind },
  ];

  const save = useCallback(() => {
    if (!newIndicator.name || !newIndicator.refId) {
      setValidate(true);
      return;
    }
    if (indicatorKind === 'common') {
      void createCommonIndicator({ indicator: newIndicator });
    } else {
      void createProjectIndicator({
        projectId,
        createProjectIndicatorRequestPayload: { indicator: newIndicator },
      });
    }
  }, [newIndicator, indicatorKind, createCommonIndicator, createProjectIndicator, projectId]);

  return (
    <Page title={strings.REPORTS} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PageForm cancelID='cancelNewIndicator' saveID='saveNewIndicator' onCancel={goToProjectReports} onSave={save}>
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
                  {strings.ADD_INDICATOR}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Dropdown
                  fullWidth
                  id='indicatorKind'
                  label={strings.INDICATOR_TYPE}
                  onChange={(value) => setIndicatorKind(value as IndicatorKind)}
                  options={kindOptions}
                  selectedValue={indicatorKind}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  errorText={validate && !newIndicator.name ? strings.REQUIRED_FIELD : ''}
                  id='name'
                  label={strings.NAME}
                  onChange={onChangeCallback('name')}
                  required
                  type='text'
                  value={newIndicator.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='description'
                  label={strings.DESCRIPTION}
                  onChange={onChangeCallback('description')}
                  type='textarea'
                  value={newIndicator.description}
                />
              </Grid>
              <Grid item xs={12}>
                <Dropdown
                  fullWidth
                  id='level'
                  label={strings.INDICATOR_LEVEL}
                  onChange={onChangeCallback('level')}
                  options={indicatorTypeOptions()}
                  selectedValue={newIndicator.level}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='unit'
                  label={strings.UNIT}
                  maxLength={25}
                  onChange={onChangeCallback('unit')}
                  type='text'
                  value={newIndicator.unit}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  errorText={validate && !newIndicator.refId ? strings.REQUIRED_FIELD : ''}
                  id='refId'
                  label={strings.REF_ID}
                  onChange={onChangeCallback('refId')}
                  required
                  type='text'
                  value={newIndicator.refId}
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
                  selectedValue={newIndicator.category}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='primaryDataSource'
                  label={strings.PRIMARY_DATA_SOURCE}
                  onChange={onChangeCallback('primaryDataSource')}
                  type='text'
                  value={newIndicator.primaryDataSource}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='tfOwner'
                  label={strings.TF_OWNER_REVIEWER}
                  onChange={onChangeCallback('tfOwner')}
                  type='text'
                  value={newIndicator.tfOwner}
                />
              </Grid>
              <Grid item xs={12}>
                <Dropdown
                  fullWidth
                  id='classId'
                  label={strings.CUMULATIVE_OR_LEVEL}
                  onChange={onChangeCallback('classId')}
                  options={classIdOptions()}
                  selectedValue={newIndicator.classId}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='notes'
                  label={strings.NOTES}
                  onChange={onChangeCallback('notes')}
                  type='textarea'
                  value={newIndicator.notes}
                />
              </Grid>
              <Grid item xs={12}>
                <Dropdown
                  fullWidth
                  id='frequency'
                  label={strings.FREQUENCY_OF_REPORTING}
                  onChange={onChangeCallback('frequency')}
                  options={frequencyOptions()}
                  selectedValue={newIndicator.frequency}
                />
              </Grid>
              <Grid item xs={12}>
                <Checkbox
                  disabled={false}
                  id='isPublishable'
                  label={strings.PUBLISH_TO_FUNDER_PORTAL}
                  name='isPublishable'
                  onChange={onChangeCallback('isPublishable')}
                  value={newIndicator.isPublishable}
                />
              </Grid>
              <Grid item xs={12}>
                <Checkbox
                  disabled={false}
                  id='active'
                  label={strings.ACTIVE}
                  name='active'
                  onChange={onChangeCallback('active')}
                  value={newIndicator.active}
                />
              </Grid>
              <Grid item xs={12}>
                <Checkbox
                  disabled={false}
                  id='isDecimal'
                  label={strings.IS_DECIMAL}
                  name='isDecimal'
                  onChange={(value) => onChangeCallback('precision')(value ? 2 : 0)}
                  value={newIndicator.precision === 2}
                />
              </Grid>
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </Page>
  );
}
