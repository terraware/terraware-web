import React, { useCallback, useMemo } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { IconName, Separator } from '@terraware/web-components';

import Page from 'src/components/Page';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipants } from 'src/hooks/useParticipants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import DocumentsTable from './DocumentsTable';

export default function DocumentsView(): JSX.Element | null {
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const { goToDocumentNew } = useNavigateTo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { availableParticipants } = useParticipants();

  const query = useQuery();

  const availableProjects = useMemo(() => {
    return availableParticipants.flatMap((participant) =>
      participant.projects.map((project) => ({
        id: project.projectId,
        name: project.projectName,
        dealName: project.projectDealName,
      }))
    );
  }, [availableParticipants]);

  const filteredProject = useMemo(() => {
    if (availableProjects && query.get('dealName')) {
      return availableProjects.find((p) => p.dealName === query.get('dealName'));
    }
  }, [availableProjects, query]);

  const resetFilter = useCallback(() => {
    navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
  }, [location, navigate, query]);

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ marginTop: theme.spacing(0.5) }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            <Grid item>
              <Typography sx={{ lineHeight: '40px' }} component={'span'}>
                {strings.DEAL_NAME}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <ProjectsDropdown
                allowUnselect
                availableProjects={availableProjects}
                record={{ projectId: filteredProject?.id }}
                setRecord={(setFn) => {
                  const newProjectFilter = setFn({ projectId: filteredProject?.id });
                  if (newProjectFilter.projectId) {
                    const newProject = availableProjects.find((p) => p.id === newProjectFilter.projectId);
                    if (newProject?.dealName) {
                      query.set('dealName', newProject.dealName);
                      resetFilter();
                    }
                  } else {
                    query.delete('dealName');
                    resetFilter();
                  }
                }}
                label={''}
                unselectLabel={strings.ALL}
                unselectValue={undefined}
                useDealName
              />
            </Grid>
          </Grid>
        </>
      ) : undefined,
    [activeLocale, availableProjects, filteredProject?.id, query, resetFilter, theme]
  );

  return (
    <Page
      leftComponent={PageHeaderLeftComponent}
      primaryButton={{
        icon: 'plus' as IconName,
        onClick: goToDocumentNew,
        title: strings.ADD_DOCUMENT,
      }}
      title={strings.DOCUMENTS}
    >
      <DocumentsTable />
    </Page>
  );
}
