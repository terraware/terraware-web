import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import { getUser } from 'src/api/user/user';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import PageCard from './common/PageCard';
import TfDivisor from './common/TfDivisor';
import PageHeader from './seeds/PageHeader';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      padding: '20px 0',
    },
    mainGrid: {
      display: 'flex',
      width: '100%',
      margin: 0,
    },
    main: {
      background:
        'url(/assets/trees-right.png) no-repeat 100% 100%/auto 248px, url(/assets/trees-left.png) no-repeat 0 100%/auto 175px, url(/assets/water.png) repeat-x 0 100%/auto 142px, url(/assets/mountain.png) no-repeat 0 100%/auto 233px, url(/assets/far-mountain.png) no-repeat 100% 100%/auto 317px, url(/assets/background.png) no-repeat 100% 0/90% 633px, linear-gradient(to bottom right, rgb(255, 255, 255) 0%, rgb(199, 226, 234) 100%) no-repeat 0 0/auto',
      height: 'calc( 100% - 64px)',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
    },
  })
);

export type HomeProps = {
  organization?: ServerOrganization;
};

export default function Home({ organization }: HomeProps): JSX.Element {
  const classes = useStyles();
  const role = organization?.role;
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded) {
        setUser(response.user ?? undefined);
      }
    };
    populateUser();
  }, []);
  return (
    <main className={classes.main}>
      <PageHeader
        title={
          user?.firstName ? strings.formatString(strings.GOOD_MORNING_PERSON, user.firstName) : strings.GOOD_MORNING
        }
        subtitle=''
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3} className={classes.mainGrid}>
          {(role === 'Manager' || role === 'Owner' || role === 'Admin') && (
            <>
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
                    icon='person'
                    description={strings.PEOPLE_CARD_DESCRIPTION}
                    link='/people'
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TfDivisor />
              </Grid>
            </>
          )}
          <>
            <Grid item xs={4}>
              <PageCard
                name={strings.SEEDS}
                icon='seeds'
                description={strings.SEEDS_CARD_DESCRIPTION}
                link='/seeds-summary'
              />
            </Grid>
            <Grid item xs={4}>
              <PageCard
                name={strings.PLANTS}
                icon='restorationSite'
                description={strings.PLANTS_CARD_DESCRIPTION}
                link='/plants-dashboard'
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
          </>
        </Grid>
      </Container>
    </main>
  );
}
