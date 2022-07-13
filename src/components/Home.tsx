import { Container, Grid } from '@mui/material';
import { Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getUser } from 'src/api/user/user';
import PageCard from 'src/components/common/PageCard';
import PageHeader from 'src/components/seeds/PageHeader';
import TfDivisor from 'src/components/common/TfDivisor';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import homePageStrings from 'src/strings/homePage';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import { isAdmin } from 'src/utils/organization';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
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
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px',
  },
  extraPadding: {
    paddingLeft: '12px',
  },
}));

export type HomeProps = {
  organizations?: ServerOrganization[];
  selectedOrganization?: ServerOrganization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
};

export default function Home({ organizations, selectedOrganization, setSelectedOrganization }: HomeProps): JSX.Element {
  const classes = useStyles();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    let cancel = false;
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded && !cancel) {
        setUser(response.user ?? undefined);
      }
    };
    populateUser();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <main className={classes.main}>
      <PageHeader
        title={
          user?.firstName
            ? strings.formatString(homePageStrings.WELCOME_PERSON, user.firstName)
            : homePageStrings.WELCOME
        }
        subtitle=''
        titleClassName={classes.extraPadding}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3} className={classes.mainGrid} sx={{ padding: 0 }}>
          {selectedOrganization?.role && isAdmin(selectedOrganization) && (
            <>
              <Grid item xs={6}>
                <PageCard
                  name={strings.PEOPLE}
                  icon='person'
                  description={homePageStrings.PEOPLE_CARD_DESCRIPTION}
                  link={APP_PATHS.PEOPLE}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.PEOPLE) as string}
                  linkStyle={'underline'}
                />
              </Grid>
              <Grid item xs={6}>
                <PageCard
                  name={strings.SEED_BANKS}
                  icon='seedbankNav'
                  description={homePageStrings.SEED_BANKS_CARD_DESCRIPTION}
                  link={APP_PATHS.SEED_BANKS}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.SEED_BANKS) as string}
                  linkStyle={'underline'}
                />
              </Grid>
              <Grid item xs={12}>
                <TfDivisor />
              </Grid>
            </>
          )}
          <Grid item xs={4}>
            <PageCard
              name={strings.SPECIES}
              icon='species'
              description={homePageStrings.SPECIES_CARD_DESCRIPTION}
              link={APP_PATHS.SPECIES}
              linkText={strings.formatString(homePageStrings.GO_TO, strings.SPECIES) as string}
              linkStyle={'underline'}
            />
          </Grid>
          <Grid item xs={4}>
            <PageCard
              name={strings.ACCESSIONS}
              icon='seeds'
              description={homePageStrings.ACCESSIONS_CARD_DESCRIPTION}
              link={APP_PATHS.ACCESSIONS}
              linkText={strings.formatString(homePageStrings.GO_TO, strings.ACCESSIONS) as string}
              linkStyle={'underline'}
            />
          </Grid>
          <Grid item xs={4}>
            <PageCard
              name={strings.MONITORING}
              icon='monitoringNav'
              description={homePageStrings.MONITORING_CARD_DESCRIPTION}
              link={APP_PATHS.MONITORING}
              linkText={strings.formatString(homePageStrings.GO_TO, strings.MONITORING) as string}
              linkStyle={'underline'}
            />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
