import React, { useCallback, useEffect, useMemo } from 'react';
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
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import Button from 'src/components/common/button/Button';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const crumbs: Crumb[] = [
  {
    name: strings.PROJECTS,
    to: APP_PATHS.PROJECTS,
  },
];

export default function ProjectView(): JSX.Element {
  const dispatch = useAppDispatch();

  const history = useHistory();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

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
        // TODO open up delete confirmation
      }
    }
  }, []);

  const goToEditProject = useCallback(() => {
    const editProjectLocation = getLocation(
      APP_PATHS.PROJECT_EDIT.replace(':projectId', pathParams.projectId),
      location
    );
    history.push(editProjectLocation);
  }, [history, location, pathParams.projectId]);

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
    </Page>
  );
}
