import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';

import CannotDeleteApplicationProject from 'src/components/ProjectView/CannotDeleteApplicationProject';
import DeleteConfirmationDialog from 'src/components/ProjectView/DeleteConfirmationDialog';
import ProjectEditModal from 'src/components/ProjectView/ProjectEditModal';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import { requestProjectDelete } from 'src/redux/features/projects/projectsAsyncThunks';
import { selectProject, selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { requestProject, requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

export default function ProjectView(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { allApplications } = useApplicationData();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const projectDeleteRequest = useAppSelector((state) => selectProjectRequest(state, requestId));

  const projectHasApplication = useMemo(() => {
    if (projectId && allApplications !== undefined) {
      return !!allApplications.find((application) => application.projectId === projectId);
    }
  }, [allApplications, projectId]);

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

  const openEditModal = useCallback(() => setIsEditModalOpen(true), []);
  const closeEditModal = useCallback(() => setIsEditModalOpen(false), []);

  const reloadProject = useCallback(() => {
    void dispatch(requestProject(projectId));
  }, [dispatch, projectId]);

  const goToProjects = useCallback(() => navigate(getLocation(APP_PATHS.PROJECTS, location)), [navigate, location]);

  useEffect(() => {
    if (!projectDeleteRequest) {
      return;
    }

    if (projectDeleteRequest.status === 'error') {
      snackbar.toastError();
    } else if (projectDeleteRequest.status === 'success' && selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id));
      goToProjects();
    }
  }, [selectedOrganization, projectDeleteRequest, snackbar, goToProjects, dispatch]);

  const rightComponents = useMemo(
    () =>
      isAdmin(selectedOrganization) && (
        <Grid item>
          <Button label={strings.EDIT_PROJECT} icon='iconEdit' onClick={openEditModal} size='medium' id='editProject' />
          <OptionsMenu
            onOptionItemClick={onOptionItemClick}
            optionItems={[{ label: strings.DELETE, value: 'delete', type: 'destructive' }]}
          />
        </Grid>
      ),
    [openEditModal, onOptionItemClick, selectedOrganization, strings]
  );

  return (
    <Box component='main' sx={{ display: 'flex', flexDirection: 'column', paddingRight: theme.spacing(4) }}>
      {isAdmin(selectedOrganization) && (
        <ProjectEditModal
          open={isEditModalOpen}
          onClose={closeEditModal}
          project={project}
          reload={reloadProject}
        />
      )}
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
        <Grid container padding={theme.spacing(0, 0, 2, 0)}>
          <Grid item xs={12}>
            <BackToLink
              id='back'
              to={APP_PATHS.PROJECTS}
              name={strings.PROJECTS}
              style={{ marginBottom: theme.spacing(3) }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            paddingLeft={theme.spacing(3)}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Grid item>
              <Typography
                fontSize='24px'
                fontWeight={600}
                margin={0}
                sx={{
                  wordBreak: 'break-all',
                }}
              >
                {project?.name || ''}
              </Typography>
            </Grid>
            {rightComponents}
          </Grid>
        </Grid>
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: theme.spacing(1),
            padding: theme.spacing(3, 4),
            margin: 0,
          }}
        >
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
      {projectHasApplication ? (
        <CannotDeleteApplicationProject open={isDeleteConfirmationOpen} onClose={onDeleteConfirmationDialogClose} />
      ) : (
        <DeleteConfirmationDialog
          open={isDeleteConfirmationOpen}
          onClose={onDeleteConfirmationDialogClose}
          onSubmit={onDeleteConfirmationDialogSubmit}
        />
      )}
    </Box>
  );
}
