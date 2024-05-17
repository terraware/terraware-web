import React from 'react';

import { Box, Container, Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import PageCard from 'src/components/common/PageCard';
import { APP_PATHS } from 'src/constants';
import { useOrganization, useUser } from 'src/providers';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

const useStyles = makeStyles((theme: Theme) => ({
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
  },
}));

const TerrawareHomeView = () => {
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isTablet, isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

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

  return (
    <main className={classes.main}>
      <Box paddingRight={'24px'}>
        <PageHeader
          title={user?.firstName ? strings.formatString(strings.WELCOME_PERSON, user.firstName) : strings.WELCOME}
          subtitle=''
        />
        <Container maxWidth={false} sx={{ padding: 0 }}>
          <Grid container spacing={3} sx={{ padding: 0 }}>
            {isAdmin(selectedOrganization) && (
              <>
                <Grid item xs={primaryGridSize()}>
                  <PageCard
                    id='peopleHomeCard'
                    name={strings.PEOPLE}
                    icon='person'
                    description={strings.PEOPLE_CARD_DESCRIPTION}
                    link={APP_PATHS.PEOPLE}
                    linkText={strings.formatString(strings.GO_TO, strings.PEOPLE) as string}
                    linkStyle={'plain'}
                  />
                </Grid>
                <Grid item xs={primaryGridSize()}>
                  <PageCard
                    id='seedbankHomeCard'
                    name={strings.SEED_BANKS}
                    icon='seedbankNav'
                    description={strings.SEED_BANKS_CARD_DESCRIPTION}
                    link={APP_PATHS.SEED_BANKS}
                    linkText={strings.formatString(strings.GO_TO, strings.SEED_BANKS) as string}
                    linkStyle={'plain'}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={secondaryGridSize()}>
              <PageCard
                id='speciesHomeCard'
                name={strings.SPECIES}
                icon='species'
                description={strings.SPECIES_CARD_DESCRIPTION}
                link={APP_PATHS.SPECIES}
                linkText={strings.formatString(strings.GO_TO, strings.SPECIES) as string}
                linkStyle={'plain'}
              />
            </Grid>
            <Grid item xs={secondaryGridSize()}>
              <PageCard
                id='accessionsHomeCard'
                name={strings.ACCESSIONS}
                icon='seeds'
                description={strings.ACCESSIONS_CARD_DESCRIPTION}
                link={APP_PATHS.ACCESSIONS}
                linkText={strings.formatString(strings.GO_TO, strings.ACCESSIONS) as string}
                linkStyle={'plain'}
              />
            </Grid>
            <Grid item xs={secondaryGridSize()}>
              <PageCard
                id='monitoringHomeCard'
                name={strings.MONITORING}
                icon='monitoringNav'
                description={strings.MONITORING_CARD_DESCRIPTION}
                link={APP_PATHS.MONITORING}
                linkText={strings.formatString(strings.GO_TO, strings.MONITORING) as string}
                linkStyle={'plain'}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </main>
  );
};

export default TerrawareHomeView;
