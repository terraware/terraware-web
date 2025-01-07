import React, { useEffect, useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useNavigate } from 'react-router-dom';

import { Box, Container, Grid, Typography } from '@mui/material';
import { IconName } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import Link from 'src/components/common/Link';
import PageCard from 'src/components/common/PageCard';
import TfMain from 'src/components/common/TfMain';
import {
  ACCELERATOR_LINK,
  APP_PATHS,
  TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK,
  TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK,
} from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useOrgNurserySummary } from 'src/hooks/useOrgNurserySummary';
import { useSeedBankSummary } from 'src/hooks/useSeedBankSummary';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import NewApplicationModal from 'src/scenes/ApplicationRouter/NewApplicationModal';
import CTACard from 'src/scenes/Home/CTACard';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import { PreferencesService } from 'src/services';
import strings from 'src/strings';
import { isAdmin, isManagerOrHigher, selectedOrgHasFacilityType } from 'src/utils/organization';

import OrganizationStatsCard, { OrganizationStatsCardRow } from './OrganizationStatsCard';

const TerrawareHomeView = () => {
  const { activeLocale } = useLocalization();
  const { user } = useUser();
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();
  const { isTablet, isMobile, isDesktop } = useDeviceInfo();
  const mixpanel = useMixpanel();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { goToNewAccession } = useNavigateTo();
  const plantingSites = useAppSelector(selectPlantingSites);
  const { availableSpecies } = useSpecies();
  const seedBankSummary = useSeedBankSummary();
  const orgNurserySummary = useOrgNurserySummary();
  const [showAcceleratorCard, setShowAcceleratorCard] = useState(true);

  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (orgPreferences.showAcceleratorCard === false && showAcceleratorCard) {
      setShowAcceleratorCard(false);
    }
  }, [orgPreferences]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      dispatch(requestObservations(selectedOrganization.id));
      dispatch(requestObservationsResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  const isLoadingInitialData = useMemo(
    () =>
      availableSpecies === undefined ||
      orgNurserySummary?.requestSucceeded === undefined ||
      seedBankSummary?.requestSucceeded === undefined,
    [availableSpecies, orgNurserySummary, seedBankSummary]
  );

  const showHomePageOnboardingImprovements = useMemo(
    () => typeof availableSpecies?.length === 'number' && availableSpecies?.length > 0,
    [availableSpecies]
  );

  const speciesLastModifiedDate = useMemo(() => {
    if (!availableSpecies?.length) {
      return undefined;
    }

    const lastModifiedTime = availableSpecies.sort(
      (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    )[0].modifiedTime;

    return getDateDisplayValue(lastModifiedTime);
  }, [availableSpecies]);

  const primaryGridSize = useMemo(() => (isMobile ? 12 : 6), [isMobile]);

  const secondaryGridSize = useMemo(() => {
    if (isMobile) {
      return 12;
    }
    if (isTablet) {
      return 6;
    }
    return 4;
  }, [isMobile, isTablet]);

  const dismissAcceleratorCard = async () => {
    await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
      ['showAcceleratorCard']: false,
    });
    reloadOrgPreferences();
  };

  const organizationStatsCardRows: OrganizationStatsCardRow[] = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    const rows: OrganizationStatsCardRow[] = [
      {
        buttonProps: isManagerOrHigher(selectedOrganization)
          ? {
              label: strings.ADD_SPECIES,
              onClick: () => {
                navigate(APP_PATHS.SPECIES_NEW);
              },
            }
          : {
              label: strings.VIEW_SPECIES_LIST,
              onClick: () => {
                navigate(APP_PATHS.SPECIES);
              },
            },
        icon: 'seeds' as IconName,
        statsCardItems: [
          { label: strings.TOTAL_SPECIES, value: availableSpecies?.length.toString() },
          {
            label: strings.LAST_UPDATED,
            value: speciesLastModifiedDate,
          },
        ],
        title: strings.SPECIES,
      },
      {
        buttonProps: isAdmin(selectedOrganization)
          ? {
              label: selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
                ? strings.ADD_AN_ACCESSION
                : strings.SET_UP_SEED_BANK,
              onClick: () => {
                selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
                  ? navigate(APP_PATHS.ACCESSIONS2_NEW)
                  : navigate(APP_PATHS.SEED_BANKS_NEW);
              },
            }
          : {
              label: strings.ADD_AN_ACCESSION,
              onClick: () => {
                selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
                  ? goToNewAccession()
                  : navigate(APP_PATHS.ACCESSIONS);
              },
            },
        icon: 'seeds' as IconName,
        statsCardItems: [
          {
            label: strings.TOTAL_SEED_COUNT,
            value: seedBankSummary?.value?.seedsRemaining.total?.toString(),
          },
          {
            label: strings.TOTAL_ACTIVE_ACCESSIONS,
            linkOnClick: () => {
              navigate(APP_PATHS.SEEDS_DASHBOARD);
            },
            linkText: strings.VIEW_FULL_DASHBOARD,
            value: seedBankSummary?.value?.activeAccessions?.toString(),
          },
        ],
        title: strings.SEEDS,
      },
      {
        buttonProps: isAdmin(selectedOrganization)
          ? {
              label: selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
                ? strings.ADD_INVENTORY
                : strings.SET_UP_NURSERY,
              onClick: () => {
                selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
                  ? navigate(APP_PATHS.INVENTORY_NEW)
                  : navigate(APP_PATHS.NURSERIES_NEW);
              },
            }
          : {
              label: strings.ADD_INVENTORY,
              onClick: () => {
                selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
                  ? navigate(APP_PATHS.INVENTORY_NEW)
                  : navigate(APP_PATHS.INVENTORY);
              },
            },
        icon: 'iconSeedling' as IconName,
        statsCardItems: [
          { label: strings.TOTAL_SEEDLINGS_COUNT, value: orgNurserySummary?.totalQuantity?.toString() },
          {
            label: strings.TOTAL_WITHDRAWN_FOR_PLANTING,
            value: orgNurserySummary?.totalWithdrawn?.toString(),
            linkOnClick: () => {
              navigate(APP_PATHS.NURSERY_WITHDRAWALS);
            },
            linkText: strings.VIEW_PLANTING_PROGRESS,
          },
        ],
        title: strings.SEEDLINGS,
      },
    ];

    if (!plantingSites?.length && isAdmin(selectedOrganization)) {
      rows.push({
        buttonProps: {
          label: strings.ADD_PLANTING_SITE,
          onClick: () => {
            navigate(`${APP_PATHS.PLANTING_SITES}?new=true`);
          },
        },
        icon: 'iconRestorationSite' as IconName,
        statsCardItems: [],
        title: strings.PLANTS,
      });
    }

    return rows;
  }, [
    activeLocale,
    availableSpecies,
    orgNurserySummary,
    plantingSites,
    seedBankSummary,
    selectedOrganization,
    speciesLastModifiedDate,
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
        {isLoadingInitialData ? null : showHomePageOnboardingImprovements ? (
          <Box>
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
                  <OrganizationStatsCard rows={organizationStatsCardRows} />
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

                          <Link fontSize='16px' fontWeight={400} onClick={dismissAcceleratorCard}>
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
        ) : (
          <Box>
            <PageHeader
              title={user?.firstName ? strings.formatString(strings.WELCOME_PERSON, user.firstName) : strings.WELCOME}
              subtitle=''
            />
            <Container maxWidth={false} sx={{ padding: 0 }}>
              <Grid container spacing={3} sx={{ padding: 0 }}>
                {isAdmin(selectedOrganization) && (
                  <>
                    <Grid item xs={primaryGridSize}>
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
                    <Grid item xs={primaryGridSize}>
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
                <Grid item xs={secondaryGridSize}>
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
                <Grid item xs={secondaryGridSize}>
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
                {isAdmin(selectedOrganization) && (
                  <Grid item xs={secondaryGridSize}>
                    <PageCard
                      cardIsClickable={false}
                      id='applicationHomeCard'
                      name={strings.APPLY_TO_ACCELERATOR}
                      icon='iconFile'
                      description={strings.formatString(
                        strings.APPLY_TO_ACCELERATOR_DESCRIPTION,
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
                      link={APP_PATHS.APPLICATIONS}
                      linkText={strings.START_NEW_APPLICATION}
                      linkStyle={'button-primary'}
                      onClick={() => {
                        mixpanel?.track(MIXPANEL_EVENTS.HOME_ACCELERATOR_APPLY_BUTTON);
                        setIsNewApplicationModalOpen(true);
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

export default TerrawareHomeView;
