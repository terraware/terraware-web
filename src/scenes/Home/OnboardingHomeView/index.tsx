import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Container, Grid } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { IconName } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useOrganization, useUser } from 'src/providers';
import { useListOrganizationUsersQuery } from 'src/queries/generated/organizationUsers';
import OnboardingCard, { OnboardingCardRow } from 'src/scenes/Home/OnboardingHomeView/OnboardingCard';
import strings from 'src/strings';
import { isManagerOrHigher, isOwner } from 'src/utils/organization';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

const OnboardingHomeView = () => {
  const { user } = useUser();
  const { selectedOrganization, orgPreferences } = useOrganization();
  const updateUserPreferences = useUpdateUserPreferences();
  const { isMobile, isDesktop } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const query = useQuery();

  const { species: allSpecies } = useOrganizationSpecies();

  useEffect(() => {
    if (selectedOrganization && query.get('newOrg') === 'true') {
      snackbar.toastSuccess(
        isDesktop ? strings.ORGANIZATION_CREATED_MSG_DESKTOP : strings.ORGANIZATION_CREATED_MSG,
        strings.formatString(strings.ORGANIZATION_CREATED_TITLE, selectedOrganization.name)
      );
    }
  }, [snackbar, selectedOrganization, isDesktop, query]);

  const { currentData: peopleData } = useListOrganizationUsersQuery(
    isOwner(selectedOrganization) ? selectedOrganization.id : skipToken
  );
  const people = peopleData?.users;

  const isLoadingInitialData = useMemo(
    () => allSpecies === undefined || (isOwner(selectedOrganization) && people === undefined),
    [allSpecies, people, selectedOrganization]
  );

  const markAsComplete = useCallback(async () => {
    if (selectedOrganization) {
      await updateUserPreferences({ ['singlePersonOrg']: true }, selectedOrganization.id);
    }
  }, [selectedOrganization, updateUserPreferences]);

  const onboardingCardRows: OnboardingCardRow[] = useMemo(() => {
    const rows = isOwner(selectedOrganization)
      ? [
          {
            buttonProps: {
              label: strings.ADD_PEOPLE,
              onClick: () => {
                navigate(APP_PATHS.PEOPLE, { state: { openAddPerson: true } });
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
  }, [isLoadingInitialData, markAsComplete, navigate, allSpecies, people, selectedOrganization, orgPreferences]);

  return (
    <TfMain>
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
              </Grid>
            </Container>
          </Box>
        )}
      </Box>
    </TfMain>
  );
};

export default OnboardingHomeView;
