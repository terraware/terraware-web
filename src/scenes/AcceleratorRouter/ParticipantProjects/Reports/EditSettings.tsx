import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { NewAcceleratorReportConfig } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';

export default function EditSettings(): JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const saveReportConfig = async () => {};
  const { isMobile } = useDeviceInfo();

  const goToProjectReports = () => {
    navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId.toString())}?tab=settings`);
  };

  const [newConfig, , onChange] = useForm<NewAcceleratorReportConfig>({
    reportingStartDate: '',
    reportingEndDate: '',
    frequency: 'Annual',
  });

  return (
    <Page title={strings.REPORTS} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <PageForm
        cancelID='cancelReportConfig'
        saveID='saveReportConfig'
        onCancel={goToProjectReports}
        onSave={() => saveReportConfig()}
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
                  onDateChange={(value) => onChange('reportingStartDate', value)}
                  value={newConfig.reportingStartDate}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  id='reportingEndDate'
                  label={strings.END_DATE}
                  aria-label='reportingEndDate'
                  onDateChange={(value) => onChange('reportingEndDate', value)}
                  value={newConfig.reportingEndDate}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id='logframe'
                  label={strings.LOG_FRAME_AND_ME_PLAN_URL}
                  type='text'
                  onChange={(value) => onChange('logframe', value)}
                  disabled={true}
                  value={''}
                />
              </Grid>
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </Page>
  );
}
