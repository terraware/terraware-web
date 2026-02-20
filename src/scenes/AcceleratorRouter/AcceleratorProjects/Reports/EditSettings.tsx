import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import {
  useCreateAcceleratorReportConfigMutation,
  useLazyListAcceleratorReportConfigQuery,
  useUpdateProjectAcceleratorReportConfigMutation,
} from 'src/queries/generated/reports';
import { NewAcceleratorReportConfig } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export default function EditSettings(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const [listReportConfigs, listReportConfigResponse] = useLazyListAcceleratorReportConfigQuery();
  const [createReportConfig, createReportConfigResponse] = useCreateAcceleratorReportConfigMutation();
  const [updateReportConfig, updateReportConfigResponse] = useUpdateProjectAcceleratorReportConfigMutation();

  const snackbar = useSnackbar();

  const goToProjectReports = useCallback(() => {
    navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId.toString())}?tab=settings`);
  }, [navigate, projectId]);

  useEffect(() => {
    if (projectId) {
      void listReportConfigs(projectId, true);
    }
  }, [projectId, listReportConfigs]);

  const projectReportConfig = useMemo(
    () => listReportConfigResponse.data?.configs?.[0],
    [listReportConfigResponse.data?.configs]
  );

  useEffect(() => {
    if (createReportConfigResponse.isError) {
      snackbar.toastError();
    } else if (createReportConfigResponse.isSuccess) {
      goToProjectReports();
    }
  }, [createReportConfigResponse, goToProjectReports, snackbar]);

  useEffect(() => {
    if (updateReportConfigResponse.isError) {
      snackbar.toastError();
    } else if (updateReportConfigResponse.isSuccess) {
      goToProjectReports();
    }
  }, [updateReportConfigResponse, goToProjectReports, snackbar]);

  const [newConfig, , onChange, onChangeCallback] = useForm<NewAcceleratorReportConfig>({
    reportingStartDate: projectReportConfig?.reportingStartDate || '',
    reportingEndDate: projectReportConfig?.reportingEndDate || '',
    logframeUrl: projectReportConfig?.logframeUrl,
  });

  const saveReportConfig = useCallback(() => {
    if (projectReportConfig) {
      void updateReportConfig({
        projectId,
        updateProjectAcceleratorReportConfigRequestPayload: {
          config: newConfig,
        },
      });
    } else {
      void createReportConfig({
        projectId,
        createAcceleratorReportConfigRequestPayload: {
          config: newConfig,
        },
      });
    }
  }, [createReportConfig, newConfig, projectId, projectReportConfig, updateReportConfig]);

  const onDateChangeCallback = useCallback(
    (id: string) => (value?: DateTime) => {
      onChange(id, value?.toFormat('yyyy-MM-dd'));
    },
    [onChange]
  );

  return (
    <Page title={strings.REPORTS} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PageForm
        cancelID='cancelReportConfig'
        saveID='saveReportConfig'
        onCancel={goToProjectReports}
        onSave={saveReportConfig}
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
                  {strings.SETTINGS}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  id='reportingStartDate'
                  label={strings.START_DATE}
                  aria-label='reportingStartDate'
                  onDateChange={onDateChangeCallback('reportingStartDate')}
                  value={newConfig.reportingStartDate}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  id='reportingEndDate'
                  label={strings.END_DATE}
                  aria-label='reportingEndDate'
                  onDateChange={onDateChangeCallback('reportingEndDate')}
                  value={newConfig.reportingEndDate}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='logframe'
                  label={strings.LOG_FRAME_AND_ME_PLAN_URL}
                  type='text'
                  onChange={onChangeCallback('logframeUrl')}
                  value={newConfig.logframeUrl}
                />
              </Grid>
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </Page>
  );
}
