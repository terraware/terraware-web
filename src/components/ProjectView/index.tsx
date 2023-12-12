import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Grid, Typography } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';
import { Crumb, Page } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import theme from 'src/theme';
import { useLocalization } from 'src/providers';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProject, selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import Button from 'src/components/common/button/Button';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useSnackbar from 'src/utils/useSnackbar';
import { requestProjectDelete } from 'src/redux/features/projects/projectsAsyncThunks';
import DeleteConfirmationDialog from 'src/components/ProjectView/DeleteConfirmationDialog';

export default function ProjectView(): JSX.Element {
  const dispatch = useAppDispatch();

  const snackbar = useSnackbar();
  const history = useHistory();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
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

  const makeFieldLabel = (label: string) => (
    <Typography color={theme.palette.TwClrTxtSecondary} sx={{ marginBottom: theme.spacing(1) }}>
      {label}
    </Typography>
  );

  const makeFieldValue = (value: string | undefined) => (
    <Typography
      color={theme.palette.TwClrTxt}
      fontSize={theme.typography.h6.fontSize}
      sx={{ marginBottom: theme.spacing(2) }}
    >
      {value}
    </Typography>
  );

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
      goToProjects();
    }
  }, [projectDeleteRequest, snackbar, goToProjects]);

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
            {makeFieldLabel(strings.NAME)}
            {makeFieldValue(project?.name)}
          </Grid>
          <Grid item xs={8}>
            {makeFieldLabel(strings.DESCRIPTION)}
            {makeFieldValue(project?.description)}
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
