import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import strings from 'src/strings';
import { ServerOrganization, Site } from 'src/types/Organization';
import { getAllSites, getProjectsById } from 'src/utils/organization';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
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
  { key: 'longitude', name: 'Longitude', type: 'string' },
  { key: 'latitude', name: 'Latitude', type: 'string' },
  { key: 'projectName', name: 'Projects', type: 'string' },
];

type SitesListProps = {
  organization?: ServerOrganization;
};

type SiteTable = Site & { projectName: string };
export default function SitesList({ organization }: SitesListProps): JSX.Element {
  const classes = useStyles();
  const [, setSelectedSite] = useState<Site>();
  const [sites, setSites] = useState<SiteTable[]>();

  const onSelect = (selected: Site) => {
    setSelectedSite(selected);
  };

  useEffect(() => {
    const addProjectNameToSites = () => {
      if (organization) {
        const sites = getAllSites(organization);
        const projectsById = getProjectsById(organization);
        const newSites = sites.map((site) => {
          return {
            ...site,
            projectName: projectsById.get(site.id)?.name || '',
          };
        });
        setSites(newSites);
      }
    };

    addProjectNameToSites();
  }, [organization]);

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={2}>
            <h1>{strings.SITES}</h1>
            <p>{strings.SITES_DESCRIPTION}</p>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2} className={classes.centered}>
            <Button id='new-site' label={strings.ADD_SITE} onClick={() => {}} />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={10}>
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
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}
