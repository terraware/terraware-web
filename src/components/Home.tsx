import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageCard from './common/PageCard';
import PageHeader from './seeds/PageHeader';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
      background: '#ffffff',
    },
    mainGrid: {
      display: 'flex',
      width: '100%',
    },
  })
);

export type HomeProps = {
  organization?: ServerOrganization;
};

export default function Home({ organization }: HomeProps): JSX.Element {
  const classes = useStyles();
  const role = organization?.role;
  return (
    <main>
      <PageHeader title='Good morning!' subtitle='' />
      <Container maxWidth={false} className={classes.mainContainer}>
        {(role === 'Manager' || role === 'Owner' || role === 'Admin') && (
          <Grid container spacing={3} className={classes.mainGrid}>
            <Grid item xs={role === 'Manager' ? 6 : 4}>
              <PageCard
                name={strings.PROJECTS}
                icon='folder'
                description={strings.PROJECTS_CARD_DESCRIPTION}
                link='/projects'
              />
            </Grid>
            <Grid item xs={role === 'Manager' ? 6 : 4}>
              <PageCard name={strings.SITES} icon='site' description={strings.SITES_CARD_DESCRIPTION} link='/sites' />
            </Grid>
            {(role === 'Admin' || role === 'Owner') && (
              <Grid item xs={4}>
                <PageCard
                  name={strings.PEOPLE}
                  icon='lock'
                  description={strings.PEOPLE_CARD_DESCRIPTION}
                  link='/people'
                />
              </Grid>
            )}
          </Grid>
        )}
        <Grid container spacing={3} className={classes.mainGrid}>
          <Grid item xs={4}>
            <PageCard name={strings.SEEDS} icon='seeds' description={strings.SEEDS_CARD_DESCRIPTION} link='/seeds' />
          </Grid>
          <Grid item xs={4}>
            <PageCard
              name={strings.PLANTS}
              icon='restorationSite'
              description={strings.PLANTS_CARD_DESCRIPTION}
              link='/plants'
            />
          </Grid>
          <Grid item xs={4}>
            <PageCard
              name={strings.SPECIES}
              icon='species'
              description={strings.SPECIES_CARD_DESCRIPTION}
              link='/species'
            />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
