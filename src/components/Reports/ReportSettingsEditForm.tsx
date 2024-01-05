import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Grid, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useOrganization } from 'src/providers';
import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import ReportSettingsService, { ReportsSettings } from 'src/services/ReportSettingsService';
import useSnackbar from 'src/utils/useSnackbar';
import ReportSettingsEditFormFields from './ReportSettingsEditFormFields';

interface ReportSettingsEditFormProps {
  reportsSettings: ReportsSettings;
  isEditing: boolean;
}

const ReportSettingsEditForm = ({ reportsSettings, isEditing }: ReportSettingsEditFormProps) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const history = useHistory();
  const snackbar = useSnackbar();

  const [localReportsSettings, setLocalReportsSettings] = useState(reportsSettings);

  const onSave = useCallback(async () => {
    const result = await ReportSettingsService.updateSettings({
      organizationId: selectedOrganization.id,
      ...localReportsSettings,
    });

    if (!result.requestSucceeded) {
      snackbar.toastError();
      return;
    }

    history.push(APP_PATHS.REPORTS_SETTINGS);
  }, [history, localReportsSettings, selectedOrganization.id, snackbar]);

  const onChange = useCallback(
    (key: string | number, value: boolean) => {
      if (key === 'organizationEnabled') {
        setLocalReportsSettings({
          ...localReportsSettings,
          organizationEnabled: value,
        });
        return;
      }

      // If the key is not for the org, then it is a project ID
      const currentProjectSetting = localReportsSettings?.projects.find((project) => project.projectId === Number(key));
      if (!currentProjectSetting) {
        return;
      }

      setLocalReportsSettings({
        ...localReportsSettings,
        projects: [
          ...localReportsSettings?.projects.filter((project) => project.projectId !== Number(key)),
          {
            ...currentProjectSetting,
            isEnabled: value,
          },
        ],
      });
    },
    [localReportsSettings]
  );

  return (
    <PageForm
      cancelID='cancelReportsSettings'
      saveID='saveReportsSettings'
      onCancel={() => history.push(APP_PATHS.REPORTS_SETTINGS)}
      onSave={onSave}
    >
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          margin: '0 auto',
          width: isMobile ? '100%' : '700px',
          paddingLeft: theme.spacing(isMobile ? 0 : 4),
          paddingRight: theme.spacing(isMobile ? 0 : 4),
          paddingTop: theme.spacing(5),
        }}
      >
        <Grid
          container
          width={isMobile ? '100%' : '700px'}
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: theme.spacing(4),
            padding: theme.spacing(3),
          }}
        >
          <ReportSettingsEditFormFields
            reportsSettings={localReportsSettings}
            onChange={onChange}
            isEditing={isEditing}
          />
        </Grid>
      </Container>
    </PageForm>
  );
};

export default ReportSettingsEditForm;
