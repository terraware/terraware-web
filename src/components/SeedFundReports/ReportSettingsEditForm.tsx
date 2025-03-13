import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Grid } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import ReportSettingsService, { ReportsSettings } from 'src/services/ReportSettingsService';
import useSnackbar from 'src/utils/useSnackbar';

import Card from '../common/Card';
import ReportSettingsEditFormFields from './ReportSettingsEditFormFields';

interface ReportSettingsEditFormProps {
  reportsSettings: ReportsSettings;
  isEditing: boolean;
}

const ReportSettingsEditForm = ({ reportsSettings, isEditing }: ReportSettingsEditFormProps) => {
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [localReportsSettings, setLocalReportsSettings] = useState(reportsSettings);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const onSave = useCallback(async () => {
    if (selectedOrganization.id !== -1) {
      setIsBusy(true);
      const result = await ReportSettingsService.updateSettings({
        organizationId: selectedOrganization.id,
        ...localReportsSettings,
      });

      setIsBusy(false);
      if (!result.requestSucceeded) {
        snackbar.toastError();
        return;
      }

      navigate(APP_PATHS.SEED_FUND_REPORTS_SETTINGS);
    }
  }, [navigate, localReportsSettings, selectedOrganization.id, snackbar]);

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
        projects: localReportsSettings?.projects.map((project) =>
          project.projectId !== Number(key)
            ? project
            : {
                ...currentProjectSetting,
                isEnabled: value,
              }
        ),
      });
    },
    [localReportsSettings]
  );

  return (
    <PageForm
      cancelID='cancelReportsSettings'
      saveID='saveReportsSettings'
      onCancel={() => navigate(APP_PATHS.SEED_FUND_REPORTS_SETTINGS)}
      onSave={onSave}
      busy={isBusy}
    >
      <Grid container justifyContent={'center'}>
        <Grid item>
          <Card style={{ width: isMobile ? '100%' : '700px' }}>
            <ReportSettingsEditFormFields
              reportsSettings={localReportsSettings}
              onChange={onChange}
              isEditing={isEditing}
            />
          </Card>
        </Grid>
      </Grid>
    </PageForm>
  );
};

export default ReportSettingsEditForm;
