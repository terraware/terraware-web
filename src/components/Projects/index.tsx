import React, { type JSX, useMemo, useRef, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import ProjectCellRenderer from 'src/components/Projects/ProjectCellRenderer';
import Card from 'src/components/common/Card';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useListProjectsQuery } from 'src/queries/generated/projects';
import strings from 'src/strings';
import { SearchNodePayload } from 'src/types/Search';
import { isAdmin } from 'src/utils/organization';
import { searchAndSort } from 'src/utils/searchAndSort';
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
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { activeLocale } = useLocalization();

  const { data: projectsData } = useListProjectsQuery(selectedOrganization?.id, {
    skip: selectedOrganization === undefined,
  });

  const results = useMemo(() => {
    if (!activeLocale || !projectsData?.projects) {
      return undefined;
    }

    const searchNode: SearchNodePayload | undefined = debouncedSearchTerm
      ? {
          operation: 'or',
          children: [
            { operation: 'field', field: 'name', type: 'Fuzzy', values: [debouncedSearchTerm] },
            { operation: 'field', field: 'description', type: 'Fuzzy', values: [debouncedSearchTerm] },
          ],
        }
      : undefined;

    return searchAndSort(projectsData.projects, searchNode, {
      locale: activeLocale,
      sortOrder: { field: 'name' },
    });
  }, [activeLocale, debouncedSearchTerm, projectsData]);

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
    <Box
      component='main'
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingRight: theme.spacing(4),
      }}
    >
      <PageSnackbar />
      <Card flushMobile radius={theme.spacing(1)} style={{ padding: theme.spacing(3, 4) }}>
        <Grid container ref={contentRef}>
          <Grid
            item
            xs={12}
            marginBottom='16px'
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex' }}>
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
            </Box>
            {isAdmin(selectedOrganization) &&
              (isMobile ? (
                <Button id='new-project' icon='plus' onClick={goToNewProject} size='medium' />
              ) : (
                <Button
                  id='new-project'
                  label={strings.ADD_PROJECT}
                  icon='plus'
                  onClick={goToNewProject}
                  size='medium'
                />
              ))}
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
    </Box>
  );
}
