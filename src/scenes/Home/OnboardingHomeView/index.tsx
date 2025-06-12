import React, { useEffect, useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box, Container, Grid, Typography } from '@mui/material';
import { IconName } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import { ACCELERATOR_LINK, APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useOrganization, useUser } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch } from 'src/redux/store';
import NewApplicationModal from 'src/scenes/ApplicationRouter/NewApplicationModal';
import CTACard from 'src/scenes/Home/CTACard';
import OnboardingCard, { OnboardingCardRow } from 'src/scenes/Home/OnboardingHomeView/OnboardingCard';
import { OrganizationUserService, PreferencesService } from 'src/services';
import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';
import { isAdmin, isManagerOrHigher, isOwner } from 'src/utils/organization';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

const OnboardingHomeView = () => {
  const { user } = useUser();
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();
  const { isMobile, isDesktop } = useDeviceInfo();
  const mixpanel = useMixpanel();
  const navigate = useSyncNavigate();
  const dispatch = useAppDispatch();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [showAcceleratorCard, setShowAcceleratorCard] = useState(true);
  const snackbar = useSnackbar();
  const query = useQuery();

  const { species: allSpecies } = useSpeciesData();

  useEffect(() => {
    if (selectedOrganization && query.get('newOrg') === 'true') {
      snackbar.toastSuccess(
        isDesktop ? strings.ORGANIZATION_CREATED_MSG_DESKTOP : strings.ORGANIZATION_CREATED_MSG,
        strings.formatString(strings.ORGANIZATION_CREATED_TITLE, selectedOrganization.name)
      );
    }
  }, [snackbar, selectedOrganization, isDesktop, query]);

  useEffect(() => {
    if (orgPreferences.showAcceleratorCard === false && showAcceleratorCard) {
      setShowAcceleratorCard(false);
    }
  }, [orgPreferences]);

  useEffect(() => {
    const populatePeople = async () => {
      if (isOwner(selectedOrganization)) {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
    };
    void populatePeople();
  }, [selectedOrganization]);

  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestObservations(selectedOrganization.id));
      void dispatch(requestObservationsResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

  const isLoadingInitialData = useMemo(
    () => allSpecies === undefined || (isOwner(selectedOrganization) && people === undefined),
    [allSpecies, people, selectedOrganization]
  );

  const dismissAcceleratorCard = async () => {
    if (selectedOrganization) {
      await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
        ['showAcceleratorCard']: false,
      });
      reloadOrgPreferences();
    }
  };

  const markAsComplete = async () => {
    if (selectedOrganization) {
      await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
        ['singlePersonOrg']: true,
      });
      reloadOrgPreferences();
    }
  };

  const onboardingCardRows: OnboardingCardRow[] = useMemo(() => {
    const rows = isOwner(selectedOrganization)
      ? [
          {
            buttonProps: {
              label: strings.ADD_PEOPLE,
              onClick: () => {
                navigate(APP_PATHS.PEOPLE_NEW);
              },
            },
            secondaryButtonProps: {
              label: strings.I_AM_THE_ONLY_PERSON,
              onClick: () => {
                void markAsComplete();
              },
            },
            icon: 'person' as IconName,
            title: strings.ADD_PEOPLE,
            subtitle: strings.ADD_PEOPLE_ONBOARDING_DESCRIPTION,
            enabled: !isLoadingInitialData && people?.length === 1 && !orgPreferences.singlePersonOrg,
          },
          {
            buttonProps: {
              label: strings.ADD_SPECIES,
              onClick: () => {
                navigate(APP_PATHS.SPECIES_NEW);
              },
            },

            icon: 'species' as IconName,
            title: strings.ADD_SPECIES,
            subtitle: strings.ADD_SPECIES_ONBOARDING_DESCRIPTION,
            enabled: !isLoadingInitialData && allSpecies?.length === 0,
          },
        ]
      : isManagerOrHigher(selectedOrganization)
        ? [
            {
              buttonProps: {
                label: strings.ADD_SPECIES,
                onClick: () => {
                  navigate(APP_PATHS.SPECIES_NEW);
                },
              },
              icon: 'species' as IconName,
              title: strings.ADD_SPECIES,
              subtitle: strings.ADD_SPECIES_ONBOARDING_DESCRIPTION,
              enabled: !isLoadingInitialData && allSpecies?.length === 0,
            },
          ]
        : [];

    return rows;
  }, [allSpecies, people, selectedOrganization, orgPreferences]);

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

                {isAdmin(selectedOrganization) && showAcceleratorCard && (
                  <Grid item xs={12}>
                    <CTACard
                      buttonsContainerSx={{
                        width: isMobile ? '100%' : 'auto',
                      }}
                      description={[
                        <Box key={'element-1'} sx={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column' }}>
                          <Typography
                            paddingRight={2}
                            textAlign={isDesktop ? 'left' : 'center'}
                            marginBottom={isDesktop ? 0 : 2}
                          >
                            {strings.formatString(
                              strings.FIND_OUT_MORE_ABOUT_ACCELERATOR_AND_APPLY,
                              <Link
                                fontSize='16px'
                                fontWeight={400}
                                target='_blank'
                                onClick={() => {
                                  mixpanel?.track(MIXPANEL_EVENTS.HOME_ACCELERATOR_TF_LINK);
                                  window.open(ACCELERATOR_LINK, '_blank');
                                }}
                                style={{ verticalAlign: 'baseline' }}
                              >
                                {strings.HERE}
                              </Link>
                            )}
                          </Typography>

                          <Link fontSize='16px' fontWeight={400} onClick={() => void dismissAcceleratorCard()}>
                            {strings.DISMISS}
                          </Link>
                        </Box>,
                      ]}
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
                )}
              </Grid>
            </Container>
          </Box>
        )}
      </Box>
    </TfMain>
  );
};

export default OnboardingHomeView;
