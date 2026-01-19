import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { FormControlLabel, Grid, Radio, RadioGroup, useTheme } from '@mui/material';
import { BusySpinner, Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers';
import {
  requestCreateApplication,
  requestCreateProjectApplication,
} from 'src/redux/features/application/applicationAsyncThunks';
import {
  selectApplicationCreate,
  selectApplicationCreateProject,
} from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useApplicationData } from '../../providers/Application/Context';

type NewApplication = {
  projectType: 'Existing' | 'New';
  projectId?: number;
  projectName?: string;
};

export type NewApplicationModalProps = {
  open: boolean;
  onClose: () => void;
};

const NewApplicationModal = ({ open, onClose }: NewApplicationModalProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { availableProjects } = useProjects();
  const { selectedOrganization } = useOrganization();
  const { allApplications } = useApplicationData();
  const dispatch = useAppDispatch();
  const { toastSuccess } = useSnackbar();
  const { goToApplication } = useNavigateTo();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projectNameError, setProjectNameError] = useState<string>('');
  const [projectSelectError, setProjectSelectError] = useState<string>('');
  const [projectOptions, setProjectOptions] = useState<DropdownItem[]>([]);

  const [createProjectApplicationRequestId, setCreateProjectApplicationRequestId] = useState<string>('');
  const [createApplicationRequestId, setCreateApplicationRequestId] = useState<string>('');

  const createProjectApplicationResult = useAppSelector(
    selectApplicationCreateProject(createProjectApplicationRequestId)
  );
  const createApplicationResult = useAppSelector(selectApplicationCreate(createApplicationRequestId));

  const [newApplication, setNewApplication, onChange] = useForm<NewApplication>({
    projectType: 'New',
    projectId: undefined,
  });

  // Init the options and auto select the first project option if there is a project without an application
  useEffect(() => {
    if (!allApplications) {
      return;
    }

    const nextProjectOptions = (availableProjects || [])
      .filter((project) => !allApplications.some((application) => application.projectId === project.id))
      .map((project) => ({ label: project.name, value: project.id }));

    setProjectOptions(nextProjectOptions);

    if (!newApplication.projectId && newApplication.projectType === 'New' && nextProjectOptions.length) {
      setNewApplication({
        projectType: 'Existing',
        projectId: nextProjectOptions[0]?.value,
      });
    }
  }, [allApplications, availableProjects, newApplication, setNewApplication]);

  const validateProjectName = useCallback(
    (name: string) => {
      if (name.length === 0) {
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
    if (!isLoading) {
      onClose();
    }
  }, [onClose, isLoading]);

  const onSave = useCallback(() => {
    if (selectedOrganization?.id) {
      let error = '';
      if (newApplication.projectType === 'New') {
        if ((error = validateProjectName(newApplication.projectName ?? ''))) {
          setProjectNameError(error);
          return;
        }

        const createProjectApplicationRequest = dispatch(
          requestCreateProjectApplication({
            projectName: newApplication.projectName ?? '',
            organizationId: selectedOrganization?.id,
          })
        );
        setCreateProjectApplicationRequestId(createProjectApplicationRequest.requestId);
        setIsLoading(true);
      } else {
        if ((error = validateProjectSelect(newApplication.projectId))) {
          setProjectSelectError(error);
          return;
        }

        const createApplicationRequest = dispatch(
          requestCreateApplication({ projectId: newApplication.projectId ?? -1 })
        );
        setCreateApplicationRequestId(createApplicationRequest.requestId);
        setIsLoading(true);
      }
    }
  }, [
    dispatch,
    newApplication,
    selectedOrganization,
    validateProjectName,
    validateProjectSelect,
    setProjectNameError,
    setProjectSelectError,
    setCreateApplicationRequestId,
    setCreateProjectApplicationRequestId,
    setIsLoading,
  ]);

  const onApplicationCreated = useCallback(
    (applicationId: number) => {
      if (activeLocale) {
        toastSuccess(strings.SUCCESS);
      }
      goToApplication(applicationId);
    },
    [activeLocale, goToApplication, toastSuccess]
  );

  useEffect(() => {
    if (createApplicationResult && createApplicationResult.status === 'success' && createApplicationResult.data) {
      setIsLoading(false);
      onApplicationCreated(createApplicationResult.data);
      onClose();
      return;
    }
    if (
      createProjectApplicationResult &&
      createProjectApplicationResult.status === 'success' &&
      createProjectApplicationResult.data
    ) {
      setIsLoading(false);
      onApplicationCreated(createProjectApplicationResult.data);
      onClose();
      return;
    }
  }, [createApplicationResult, createProjectApplicationResult, onApplicationCreated, onClose, setIsLoading]);

  return (
    <>
      {isLoading && <BusySpinner withSkrim={true} />}
      <DialogBox
        onClose={onCloseWrapper}
        open={open}
        title={strings.START_NEW_APPLICATION}
        size='medium'
        middleButtons={[
          <Button
            id='cancelNewApplication'
            label={strings.CANCEL}
            disabled={isLoading}
            priority='secondary'
            type='passive'
            onClick={onCloseWrapper}
            key='cancel-button'
          />,
          <Button
            id='saveNewApplication'
            label={strings.SAVE}
            disabled={isLoading}
            onClick={onSave}
            key='save-button'
          />,
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
                  disabled={!projectOptions?.length}
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
    </>
  );
};

export default NewApplicationModal;
