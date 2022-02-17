import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization, Site } from 'src/types/Organization';
import { getAllSitesWithProjectName } from 'src/utils/organization';

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      background: '#ffffff',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      marginTop: 0,
      fontSize: '24px',
    },
    mainContainer: {
      padding: '24px',
    },
    mainContent: {
      paddingTop: theme.spacing(4),
    },
    centered: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
  })
);

const columns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
  { key: 'projectName', name: 'Projects', type: 'string' },
];

type SitesListProps = {
  organization?: ServerOrganization;
};

export default function SitesList({ organization }: SitesListProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [sites, setSites] = useState<Site[]>();

  const onSelect = (selected: Site) => {
    if (selected.id) {
      const viewSiteLocation = {
        pathname: APP_PATHS.SITES_VIEW.replace(':siteId', selected.id.toString()),
      };
      history.push(viewSiteLocation);
    }
  };

  useEffect(() => {
    const addProjectNameToSites = () => {
      if (organization) {
        const allSites = getAllSitesWithProjectName(organization);
        setSites(allSites);
      }
    };

    addProjectNameToSites();
  }, [organization]);

  const goToNewSite = () => {
    const newSiteLocation = {
      pathname: APP_PATHS.SITES_NEW,
    };
    history.push(newSiteLocation);
  };

  return (
    <main className={classes.main}>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <h1 className={classes.title}>{strings.SITES}</h1>
            <p>{strings.SITES_DESCRIPTION}</p>
          </Grid>
          <Grid item xs={8} />
          <Grid item xs={2} className={classes.centered}>
            {organization && ['Admin', 'Owner'].includes(organization?.role) && (
              <Button id='new-site' label={strings.ADD_SITE} onClick={goToNewSite} size='medium' />
            )}
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.mainContent}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {sites && (
                    <Table id='sites-table' columns={columns} rows={sites} orderBy='name' onSelect={onSelect} />
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
