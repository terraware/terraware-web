import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Grid, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Checkbox } from '@terraware/web-components';

import { useOrganization } from 'src/providers';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ReportsSettings } from 'src/services/ReportSettingsService';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

import { APP_PATHS } from '../../constants';

interface ReportSettingsEditFormFieldsProps {
  isEditing: boolean;
  onChange?: (key: string | number, value: boolean) => void;
  reportsSettings: ReportsSettings;
}

interface ReportsSettingsCheckboxConfig {
  index?: number;
  key: string;
  label: string;
  value: boolean | undefined;
}

const useStyles = makeStyles(() => ({
  checkbox: {
    marginTop: 0,
    '& span[class*="-label"]': {
      fontWeight: 500,
    },
  },
}));

const ReportSettingsEditFormFields = ({ isEditing, onChange, reportsSettings }: ReportSettingsEditFormFieldsProps) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const history = useHistory();
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();

  const projects = useAppSelector(selectProjects);

  useEffect(() => {
    if (!projects) {
      void dispatch(requestProjects(selectedOrganization.id));
    }
  }, [dispatch, projects, selectedOrganization.id]);

  const renderCheckbox = useCallback(
    ({ label, key, value, index }: ReportsSettingsCheckboxConfig) => {
      return (
        <Grid item xs={12} sx={{ marginTop: theme.spacing(1) }} key={index || 0}>
          <Checkbox
            label={label}
            onChange={(checked: boolean) => onChange && onChange(key, checked)}
            id={key}
            name={key}
            value={value}
            className={classes.checkbox}
            disabled={!isEditing}
          />
        </Grid>
      );
    },
    [classes.checkbox, isEditing, onChange, theme]
  );

  const getProjectName = useCallback(
    (projectId: number) => (projects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [projects]
  );

  return (
    <>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Grid container justifyContent={'space-between'}>
          <Grid item xs={7}>
            <Typography variant={'h5'} sx={{ fontWeight: 600 }}>
              {strings.SETTINGS}
            </Typography>
          </Grid>

          {!isEditing && (
            <Grid item xs={5} textAlign={'right'}>
              <Button
                icon={'iconEdit'}
                label={strings.EDIT}
                onClick={() => history.push(APP_PATHS.REPORTS_SETTINGS_EDIT)}
              />
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ marginTop: theme.spacing(0), marginBottom: theme.spacing(2) }}>
        <Typography>{strings.REPORTS_SETTINGS_EDIT_SUBTITLE}</Typography>
      </Grid>

      {renderCheckbox({
        label: strings.formatString(strings.REPORTS_SETTINGS_GENERATE_FOR_ORG, selectedOrganization.name) as string,
        key: 'organizationEnabled',
        value: reportsSettings?.organizationEnabled,
      })}

      <Grid item xs={12} sx={{ marginTop: theme.spacing(3) }}>
        <Typography
          sx={{
            color: theme.palette.TwClrTxtSecondary,
            fontSize: '14px',
            fontWeight: 400,
          }}
        >
          {strings.REPORTS_SETTINGS_GENERATE_FOR_PROJECT}
        </Typography>
      </Grid>

      {(reportsSettings?.projects || []).map((project, index) =>
        renderCheckbox({
          index,
          label: getProjectName(project.projectId),
          key: `${project.projectId}`,
          value: project.isEnabled,
        })
      )}
    </>
  );
};

export default ReportSettingsEditFormFields;
