import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

import { Grid } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import DeleteConfirmationDialog from 'src/components/ProjectView/DeleteConfirmationDialog';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { requestProjectDelete } from 'src/redux/features/projects/projectsAsyncThunks';
import { selectProject, selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { requestProject, requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

export default function ProjectView(): JSX.Element {
  const dispatch = useAppDispatch();

  const snackbar = useSnackbar();
  const history = useHistory();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const projectDeleteRequest = useAppSelector((state) => selectProjectRequest(state, requestId));

  useEffect(() => {
    if (!project) {
      void dispatch(requestProject(projectId));
    }
  }, [projectId, project, dispatch]);

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    switch (optionItem.value) {
      case 'delete': {
        setIsDeleteConfirmationOpen(true);
      }
    }
  }, []);

  const onDeleteConfirmationDialogClose = useCallback(() => setIsDeleteConfirmationOpen(false), []);
  const onDeleteConfirmationDialogSubmit = useCallback(() => {
    const dispatched = dispatch(requestProjectDelete({ projectId }));
    setRequestId(dispatched.requestId);
  }, [dispatch, projectId]);

  const goToEditProject = useCallback(
    () => history.push(getLocation(APP_PATHS.PROJECT_EDIT.replace(':projectId', pathParams.projectId), location)),
    [history, location, pathParams.projectId]
  );

  const goToProjects = useCallback(() => history.push(getLocation(APP_PATHS.PROJECTS, location)), [history, location]);

  useEffect(() => {
    if (!projectDeleteRequest) {
      return;
    }

    if (projectDeleteRequest.status === 'error') {
      snackbar.toastError();
    } else if (projectDeleteRequest.status === 'success') {
      void dispatch(requestProjects(selectedOrganization.id));
      goToProjects();
    }
  }, [selectedOrganization.id, projectDeleteRequest, snackbar, goToProjects, dispatch]);

  const rightComponent = useMemo(
    () => (
      <>
        <Button label={strings.EDIT_PROJECT} icon='iconEdit' onClick={goToEditProject} size='medium' id='editProject' />
        <OptionsMenu
          onOptionItemClick={onOptionItemClick}
          optionItems={[{ label: activeLocale ? strings.DELETE : '', value: 'delete' }]}
        />
      </>
    ),
    [goToEditProject, onOptionItemClick, activeLocale]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.PROJECTS : '',
        to: APP_PATHS.PROJECTS,
      },
    ],
    [activeLocale]
  );

  return (
    <Page crumbs={crumbs} title={project?.name || ''} rightComponent={rightComponent}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
        <Grid container>
          <Grid item xs={4}>
            <TextField label={strings.NAME} id='name' type='text' value={project?.name} display={true} />
          </Grid>
          <Grid item xs={8}>
            <TextField
              label={strings.DESCRIPTION}
              id='description'
              type='text'
              value={project?.description}
              display={true}
            />
          </Grid>
        </Grid>
      </Card>
      <DeleteConfirmationDialog
        open={isDeleteConfirmationOpen}
        onClose={onDeleteConfirmationDialogClose}
        onCancel={onDeleteConfirmationDialogClose}
        onSubmit={onDeleteConfirmationDialogSubmit}
      />
    </Page>
  );
}
