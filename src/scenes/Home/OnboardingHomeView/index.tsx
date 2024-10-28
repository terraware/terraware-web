import React, { useEffect, useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useNavigate } from 'react-router-dom';

import { Box, Container, Grid } from '@mui/material';
//import isEnabled from 'src/features';
import { IconName } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import {
  ACCELERATOR_LINK,
  APP_PATHS,
  TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK,
  TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK,
} from 'src/constants';
import { useOrgNurserySummary } from 'src/hooks/useOrgNurserySummary';
import { useSeedBankSummary } from 'src/hooks/useSeedBankSummary';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useOrganization, useUser } from 'src/providers';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch } from 'src/redux/store';
import NewApplicationModal from 'src/scenes/ApplicationRouter/NewApplicationModal';
import CTACard from 'src/scenes/Home/CTACard';
import OnboardingCard, { OnboardingCardRow } from 'src/scenes/Home/OnboardingHomeView/OnboardingCard';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

const OnboardingHomeView = () => {
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const mixpanel = useMixpanel();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { availableSpecies } = useSpecies();
  const seedBankSummary = useSeedBankSummary();
  const orgNurserySummary = useOrgNurserySummary();
  //const homePageOnboardingImprovementsEnabled = isEnabled('Home Page Onboarding Improvements');

  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(requestObservations(selectedOrganization.id));
    dispatch(requestObservationsResults(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  const isLoadingInitialData = useMemo(
    () =>
      availableSpecies === undefined ||
      orgNurserySummary?.requestSucceeded === undefined ||
      seedBankSummary?.requestSucceeded === undefined,
    [availableSpecies, orgNurserySummary, seedBankSummary]
  );

  const onboardingCardRows: OnboardingCardRow[] = useMemo(() => {
    // if (!activeLocale) {
    //   return [];
    // }

    const rows = [
      {
        buttonProps: isAdmin(selectedOrganization)
          ? {
              label: strings.ADD_PEOPLE,
              onClick: () => {
                navigate(APP_PATHS.PEOPLE_NEW);
              },
            }
          : undefined,
        icon: 'seeds' as IconName,
        title: strings.ADD_PEOPLE,
        subtitle:
          'Invite people to your organization who will use Terraware. You can always add more people in your Settings.',
      },
      {
        buttonProps: isAdmin(selectedOrganization)
          ? {
              label: strings.ADD_SPECIES,
              onClick: () => {
                navigate(APP_PATHS.SPECIES_NEW);
              },
            }
          : undefined,
        icon: 'seeds' as IconName,
        title: strings.ADD_SPECIES,
        subtitle: 'Manage species that your organization collects and plants.',
      },
    ];

    return rows;
  }, [
    //activeLocale,
    availableSpecies,
    selectedOrganization,
  ]);

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
        {isLoadingInitialData ? null : (
          <Box paddingRight={'24px'} paddingLeft={isMobile ? '24px' : 0}>
            <PageHeader
              title={
                user?.firstName
                  ? strings.formatString(strings.WELCOME_TO_TERRAWARE_PERSON, user.firstName)
                  : strings.WELCOME
              }
              subtitle=''
            />
            <Container maxWidth={false} sx={{ padding: 0 }}>
              <Grid container spacing={3} sx={{ padding: 0 }}>
                <Grid item xs={12}>
                  <OnboardingCard rows={onboardingCardRows} />
                </Grid>
                <Grid item xs={12}>
                  <CTACard
                    description={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP_DESCRIPTION}
                    imageAlt={strings.TERRAWARE_MOBILE_APP_IMAGE_ALT}
                    imageSource='/assets/terraware-mobile-app.svg'
                    padding='32px'
                    primaryButtonProps={{
                      label: strings.DOWNLOAD_FOR_ANDROID,
                      onClick: () => {
                        window.open(TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK, '_blank');
                      },
                      type: 'passive',
                    }}
                    secondaryButtonProps={{
                      label: strings.DOWNLOAD_FOR_IOS,
                      onClick: () => {
                        window.open(TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK, '_blank');
                      },
                    }}
                    title={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CTACard
                    buttonsContainerSx={{
                      width: isMobile ? '100%' : 'auto',
                    }}
                    description={strings.formatString(
                      strings.FIND_OUT_MORE_ABOUT_ACCELERATOR_AND_APPLY,
                      <Link
                        fontSize='16px'
                        target='_blank'
                        onClick={() => {
                          mixpanel?.track(MIXPANEL_EVENTS.HOME_ACCELERATOR_TF_LINK);
                          window.open(ACCELERATOR_LINK, '_blank');
                        }}
                      >
                        {strings.HERE}
                      </Link>
                    )}
                    primaryButtonProps={{
                      label: strings.APPLY_TO_ACCELERATOR,
                      onClick: () => {
                        mixpanel?.track(MIXPANEL_EVENTS.HOME_ACCELERATOR_APPLY_BUTTON);
                        setIsNewApplicationModalOpen(true);
                      },
                      type: 'productive',
                    }}
                  />
                </Grid>
              </Grid>
            </Container>
          </Box>
        )}
      </Box>
    </TfMain>
  );
};

export default OnboardingHomeView;
