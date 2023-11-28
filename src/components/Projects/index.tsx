import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import TfMain from '../common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TextField from '../common/Textfield/Textfield';
import useDebounce from 'src/utils/useDebounce';
import { OrNodePayload, SearchRequestPayload } from 'src/types/Search';
import { SearchService } from 'src/services';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { useOrganization, useLocalization } from 'src/providers/hooks';
import { Project } from 'src/types/Project';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  contentContainer: {
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
    borderRadius: '32px',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: '32px',
  },
  searchField: {
    width: '300px',
  },
}));

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
];

export default function ProjectsList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [results, setResults] = useState<Project[]>();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { activeLocale } = useLocalization();

  const search = useCallback(
    async (searchTerm: string, skipTfContact = false) => {
      const searchField: OrNodePayload | null = searchTerm
        ? {
            operation: 'or',
            children: [
              { operation: 'field', field: 'name', type: 'Fuzzy', values: [searchTerm] },
              { operation: 'field', field: 'description', type: 'Fuzzy', values: [searchTerm] },
            ],
          }
        : null;

      const params: SearchRequestPayload = {
        prefix: 'projects',
        fields: ['name', 'description', 'id', 'organization_id'],
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'organization_id',
              type: 'Exact',
              values: [selectedOrganization.id],
            },
          ],
        },
        sortOrder: [
          {
            field: 'name',
          },
        ],
        count: 0,
      };

      if (searchField) {
        params.search.children.push(searchField);
      }

      const searchResults = await SearchService.search(params);
      const projectResults: Project[] = [];
      searchResults?.forEach((result) => {
        projectResults.push({
          name: result.name as string,
          description: result.description as string,
          id: result.id as number,
          organizationId: result.organizationId as number,
        });
      });
      return projectResults;
    },
    [selectedOrganization.id]
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
      refreshSearch();
    }
  }, [debouncedSearchTerm, search, activeLocale]);

  const goToNewProject = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.PROJECTS_NEW,
    };
    history.push(newProjectLocation);
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1 className={classes.title}>{strings.PROJECTS}</h1>
          </Grid>
          <Grid item xs={4} className={classes.centered}>
            {isMobile ? (
              <Button id='new-project' icon='plus' onClick={goToNewProject} size='medium' />
            ) : (
              <Button id='new-project' label={strings.ADD_PROJECT} icon='plus' onClick={goToNewProject} size='medium' />
            )}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Grid container className={classes.contentContainer} ref={contentRef}>
        <Grid item xs={12} marginBottom='16px'>
          <TextField
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            className={classes.searchField}
            onChange={(value) => onChangeSearch('search', value)}
            value={temporalSearchValue}
            iconRight='cancel'
            onClickRightIcon={clearSearch}
          />
        </Grid>

        <Grid item xs={12}>
          <div>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {results && <Table id='projects-table' columns={columns} rows={results} orderBy='name' />}
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </TfMain>
  );
}
