import { Container, Grid } from '@mui/material';
import { Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getUser } from 'src/api/user/user';
import PageCard from 'src/components/common/PageCard';
import PageHeader from 'src/components/seeds/PageHeader';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import homePageStrings from 'src/strings/homePage';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import { isAdmin } from 'src/utils/organization';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: 0,
  },
  main: {
    [theme.breakpoints.down('xl')]: {
      background:
        'url(/assets/home-bg-right-layer-z4.svg) no-repeat 753px 100%/auto 285px, ' +
        'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
        'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-right-z3.svg) no-repeat 911px 100%/auto 400px',
      backgroundAttachment: 'fixed',
    },
    [theme.breakpoints.up('xl')]: {
      background:
        'url(/assets/home-bg-right-layer-z4.svg) no-repeat 100% 100%/auto 285px, ' +
        'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
        'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-right-z3.svg) no-repeat 100% 100%/auto 400px',
      backgroundAttachment: 'fixed',
    },
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
}));

export type HomeProps = {
  organizations?: ServerOrganization[];
  selectedOrganization?: ServerOrganization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
};

export default function Home({ organizations, selectedOrganization, setSelectedOrganization }: HomeProps): JSX.Element {
  const { isTablet, isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [user, setUser] = useState<User>();

  const primaryGridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  const secondaryGridSize = () => {
    if (isMobile) {
      return 12;
    }
    if (isTablet) {
      return 6;
    }
    return 4;
  };

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
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3} sx={{ padding: 0 }}>
          {selectedOrganization?.role && isAdmin(selectedOrganization) && (
            <>
              <Grid item xs={primaryGridSize()}>
                <PageCard
                  name={strings.PEOPLE}
                  icon='person'
                  description={homePageStrings.PEOPLE_CARD_DESCRIPTION}
                  link={APP_PATHS.PEOPLE}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.PEOPLE) as string}
                  linkStyle={'plain'}
                />
              </Grid>
              <Grid item xs={primaryGridSize()}>
                <PageCard
                  name={strings.SEED_BANKS}
                  icon='seedbankNav'
                  description={homePageStrings.SEED_BANKS_CARD_DESCRIPTION}
                  link={APP_PATHS.SEED_BANKS}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.SEED_BANKS) as string}
                  linkStyle={'plain'}
                />
              </Grid>
            </>
          )}
          <Grid item xs={secondaryGridSize()}>
            <PageCard
              name={strings.SPECIES}
              icon='species'
              description={homePageStrings.SPECIES_CARD_DESCRIPTION}
              link={APP_PATHS.SPECIES}
              linkText={strings.formatString(homePageStrings.GO_TO, strings.SPECIES) as string}
              linkStyle={'plain'}
            />
          </Grid>
          <Grid item xs={secondaryGridSize()}>
            <PageCard
              name={strings.ACCESSIONS}
              icon='seeds'
              description={homePageStrings.ACCESSIONS_CARD_DESCRIPTION}
              link={APP_PATHS.ACCESSIONS}
              linkText={strings.formatString(homePageStrings.GO_TO, strings.ACCESSIONS) as string}
              linkStyle={'plain'}
            />
          </Grid>
          <Grid item xs={secondaryGridSize()}>
            <PageCard
              name={strings.MONITORING}
              icon='monitoringNav'
              description={homePageStrings.MONITORING_CARD_DESCRIPTION}
              link={APP_PATHS.MONITORING}
              linkText={strings.formatString(homePageStrings.GO_TO, strings.MONITORING) as string}
              linkStyle={'plain'}
            />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
