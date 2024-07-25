import React, { useCallback, useMemo, useState } from 'react';

import { FormControlLabel, Grid, Radio, RadioGroup, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers';
import ApplicationService from 'src/services/ApplicationService';
import ProjectsService from 'src/services/ProjectsService';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

type NewApplication = {
  projectType: 'Existing' | 'New';
  projectId?: number;
  projectName?: string;
};

export type NewApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (applicationId: number) => void;
};

const NewApplicationModal = ({ open, onClose, onSave }: NewApplicationModalProps): JSX.Element => {
  const theme = useTheme();

  const { activeLocale } = useLocalization();
  const { availableProjects } = useProjects();
  const { selectedOrganization } = useOrganization();

  const [projectNameError, setProjectNameError] = useState<string>('');
  const [projectSelectError, setProjectSelectError] = useState<string>('');
  const { toastError } = useSnackbar();

  const [newApplication, , onChange] = useForm<NewApplication>({
    projectType: availableProjects && availableProjects.length > 0 ? 'Existing' : 'New',
    projectId: availableProjects && availableProjects.length > 0 ? availableProjects[0].id : undefined,
  });

  const projectOptions = useMemo(
    // TODO: filter out projects that already have applications, or in the accelerator
    () => (availableProjects || []).map((project) => ({ label: project.name, value: project.id })),
    [availableProjects]
  );

  const validateProjectName = useCallback(
    (name: string) => {
      if (name.length == 0) {
        return activeLocale ? strings.REQUIRED_FIELD : 'project_name_empty';
      }
      if (!availableProjects) {
        return '';
      }
      if (availableProjects.every((project) => project.name !== name)) {
        return '';
      }
      return activeLocale ? strings.ERROR_PROJECT_NAME_CONFLICT : 'project_name_conflict';
    },
    [activeLocale, availableProjects]
  );

  const validateProjectSelect = useCallback(
    (id?: number) => {
      if (!id) {
        return activeLocale ? strings.REQUIRED_FIELD : 'project_id_empty';
      }
      if (availableProjects && availableProjects.every((project) => project.id !== id)) {
        return activeLocale ? strings.ERROR_PROJECT_SELECT : 'project_id_invalid';
      }
      return '';
    },
    [activeLocale, availableProjects]
  );

  const onCloseWrapper = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSaveWrapper = useCallback(async () => {
    let error = '';
    let projectId: number | undefined = undefined;

    if (newApplication.projectType === 'New') {
      error = validateProjectName(newApplication.projectName ?? '');
      setProjectNameError(error);

      if (!error && newApplication.projectName) {
        const projectResult = await ProjectsService.createProject({
          name: newApplication.projectName,
          organizationId: selectedOrganization.id,
        });
        if (projectResult.requestSucceeded && projectResult.data) {
          projectId = projectResult.data.id;
        } else {
          toastError(activeLocale ? strings.ERROR_CREATE_PROJECT : 'Error creating project');
          return;
        }
      } else {
        return;
      }
    } else {
      error = validateProjectSelect(newApplication.projectId);
      setProjectSelectError(error);
      if (!error) {
        projectId = newApplication.projectId;
      } else {
        return;
      }
    }

    if (!!projectId) {
      const result = await ApplicationService.createApplication(projectId);
      if (result.requestSucceeded && result.data) {
        onSave(result.data?.id);
      }
    }
  }, [onSave, newApplication, selectedOrganization, setProjectNameError]);

  return (
    <DialogBox
      onClose={onCloseWrapper}
      open={open}
      title={strings.START_NEW_APPLICATION}
      size='medium'
      middleButtons={[
        <Button
          id='cancelNewApplication'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCloseWrapper}
          key='cancel-button'
        />,
        <Button id='saveNewApplication' label={strings.SAVE} onClick={onSaveWrapper} key='save-button' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <RadioGroup
            name='radio-buttons-project-selection'
            onChange={(_event, value) => onChange('projectType', value)}
            value={newApplication.projectType}
          >
            <Grid item xs={12} textAlign='left' display='flex' flexDirection='row'>
              <FormControlLabel
                checked={newApplication.projectType === 'Existing'}
                control={<Radio />}
                disabled={!availableProjects?.length}
                label={strings.SELECT_EXISTING_PROJECT}
                value={'Existing'}
              />
              <FormControlLabel
                checked={newApplication.projectType === 'New'}
                control={<Radio />}
                label={strings.CREATE_NEW_PROJECT}
                value={'New'}
              />
            </Grid>
          </RadioGroup>
        </Grid>
        <Grid item xs={12}>
          {newApplication.projectType === 'New' && (
            <TextField
              required
              type='text'
              label={strings.PROJECT_NAME}
              id='select_project'
              onChange={(value) => {
                setProjectNameError('');
                onChange('projectName', value);
              }}
              errorText={projectNameError}
              sx={{ marginTop: theme.spacing(1) }}
              value={newApplication.projectName}
            />
          )}
          {newApplication.projectType === 'Existing' && (
            <Dropdown
              errorText={projectSelectError}
              fullWidth={true}
              label={strings.SELECT_PROJECT}
              onChange={(value) => {
                setProjectSelectError('');
                onChange('projectId', value);
              }}
              options={projectOptions}
              required
              selectedValue={newApplication.projectId}
            />
          )}
        </Grid>
      </Grid>
    </DialogBox>
  );
};

export default NewApplicationModal;
