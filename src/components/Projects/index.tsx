import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import ProjectCellRenderer from 'src/components/Projects/ProjectCellRenderer';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import ProjectsService from 'src/services/ProjectsService';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import TableSettingsButton from '../common/table/TableSettingsButton';

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
];

export default function ProjectsList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState<Project[]>();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { activeLocale } = useLocalization();

  const search = useCallback(
    async (searchTerm: string) => {
      if (selectedOrganization) {
        const projects = await ProjectsService.searchProjects(selectedOrganization.id, searchTerm);
        if (projects) {
          return projects;
        }
      }
    },
    [selectedOrganization]
  );

  useEffect(() => {
    const refreshSearch = async () => {
      const requestId = Math.random().toString();
      setRequestId('searchProjects', requestId);
      const projectsResults = await search(debouncedSearchTerm);
      if (getRequestId('searchProjects') === requestId) {
        setResults(projectsResults);
      }
    };

    if (activeLocale) {
      void refreshSearch();
    }
  }, [debouncedSearchTerm, search, activeLocale]);

  const goToNewProject = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.PROJECTS_NEW,
    };
    navigate(newProjectLocation);
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 600,
              }}
            >
              {strings.PROJECTS}
            </h1>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              marginBottom: '32px',
            }}
          >
            {isMobile ? (
              <Button id='new-project' icon='plus' onClick={goToNewProject} size='medium' />
            ) : (
              <Button id='new-project' label={strings.ADD_PROJECT} icon='plus' onClick={goToNewProject} size='medium' />
            )}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Card flushMobile>
        <Grid container ref={contentRef}>
          <Grid
            item
            xs={12}
            marginBottom='16px'
            sx={{
              display: 'flex',
            }}
          >
            <TextField
              placeholder={strings.SEARCH}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              onChange={(value) => onChangeSearch('search', value)}
              value={temporalSearchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
              sx={{ width: '300px' }}
            />
            <TableSettingsButton />
          </Grid>

          <Grid item xs={12}>
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {results && (
                    <Table
                      id='projects-table'
                      columns={columns}
                      rows={results}
                      orderBy='name'
                      Renderer={ProjectCellRenderer}
                      selectedRows={[]}
                      setSelectedRows={() => undefined}
                      controlledOnSelect={false}
                    />
                  )}
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Card>
    </TfMain>
  );
}
