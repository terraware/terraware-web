import React, { useState } from 'react';

import { Box, Container, Grid } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import PageCard from 'src/components/common/PageCard';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useOrganization, useUser } from 'src/providers';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

import NewApplicationModal from '../ApplicationRouter/NewApplicationModal';

const TerrawareHomeView = () => {
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isTablet, isMobile } = useDeviceInfo();

  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState<boolean>(false);

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
    <TfMain>
      <NewApplicationModal open={isNewApplicationModalOpen} onClose={() => setIsNewApplicationModalOpen(false)} />

      <Box
        component='main'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box paddingRight={'24px'} paddingLeft={isMobile ? '24px' : 0}>
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
              {isEnabled('Accelerator Application') && (
                <Grid item xs={secondaryGridSize()}>
                  <PageCard
                    cardIsClickable={false}
                    id='applicationHomeCard'
                    name={strings.APPLY_TO_ACCELERATOR}
                    icon='iconFile'
                    description={strings.APPLY_TO_ACCELERATOR}
                    link={APP_PATHS.APPLICATIONS}
                    linkText={strings.START_NEW_APPLICATION}
                    linkStyle={'button-primary'}
                    onClick={() => setIsNewApplicationModalOpen(true)}
                  />
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      </Box>
    </TfMain>
  );
};

export default TerrawareHomeView;
