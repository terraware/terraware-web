import React, { useEffect, useMemo } from 'react';

import { Box, Container, Grid } from '@mui/material';
import { IconName } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import PageCard from 'src/components/common/PageCard';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useOrgNurserySummary } from 'src/hooks/useOrgNurserySummary';
import useOrganizationFeatures from 'src/hooks/useOrganizationFeatures';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useSeedBankSummary } from 'src/hooks/useSeedBankSummary';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { useLazySearchPlantingSitesQuery } from 'src/queries/search/plantingSites';
import MobileAppCard from 'src/scenes/Home/MobileAppCard';
import VirtualWalkthroughMessages from 'src/scenes/VirtualWalkthrough/VirtualWalkthroughMessages';
import strings from 'src/strings';
import { isAdmin, isManagerOrHigher, selectedOrgHasFacilityType } from 'src/utils/organization';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import OrganizationStatsCard, { OrganizationStatsCardRow } from './OrganizationStatsCard';
import VirtualWalkthroughCard from './VirtualWalkthroughCard';

const TerrawareHomeView = () => {
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isTablet, isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const { goToNewAccession } = useNavigateTo();
  const { species } = useOrganizationSpecies();
  const seedBankSummary = useSeedBankSummary();
  const orgNurserySummary = useOrgNurserySummary();
  const orgFeatures = useOrganizationFeatures();
  const virtualWalkthroughEnabled = !!orgFeatures?.virtualWalkthrough?.enabled;

  const [search, { data: plantingSiteSummariesData }] = useLazySearchPlantingSitesQuery();
  const plantingSiteSummaries = useMemo(() => plantingSiteSummariesData ?? [], [plantingSiteSummariesData]);

  const isLoadingInitialData = useMemo(
    () => orgNurserySummary?.requestSucceeded === undefined || seedBankSummary?.requestSucceeded === undefined,
    [orgNurserySummary, seedBankSummary]
  );

  const showHomePageOnboardingImprovements = useMemo(() => species.length > 0, [species]);

  const speciesLastModifiedDate = useMemo(() => {
    if (!species?.length) {
      return undefined;
    }

    const lastModifiedTime = [...species].sort(
      (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    )[0].modifiedTime;

    return getDateDisplayValue(lastModifiedTime);
  }, [species]);

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

  useEffect(() => {
    if (selectedOrganization) {
      void search(
        {
          organizationId: selectedOrganization.id,
        },
        true
      );
    }
  }, [search, selectedOrganization]);

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
        icon: 'species' as IconName,
        statsCardItems: [
          { label: strings.TOTAL_SPECIES, value: numberFormatter.format(species.length ?? 0) },
          {
            label: strings.SPECIES_LAST_UPDATED,
            value: speciesLastModifiedDate,
          },
        ],
        title: strings.SPECIES,
      },
      {
        buttonProps: isAdmin(selectedOrganization)
          ? {
              label:
                selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
                  ? strings.ADD_AN_ACCESSION
                  : strings.SET_UP_SEED_BANK,
              onClick: () =>
                selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
                  ? navigate(APP_PATHS.ACCESSIONS2_NEW)
                  : navigate(APP_PATHS.SEED_BANKS_NEW),
            }
          : {
              label: strings.ADD_AN_ACCESSION,
              onClick: () =>
                selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')
                  ? goToNewAccession()
                  : navigate(APP_PATHS.ACCESSIONS),
            },
        icon: 'seeds' as IconName,
        statsCardItems: [
          {
            label: strings.TOTAL_SEED_COUNT,
            value: numberFormatter.format(seedBankSummary?.value?.seedsRemaining.total ?? 0),
          },
          {
            label: strings.TOTAL_ACTIVE_ACCESSIONS,
            linkOnClick: () => {
              navigate(APP_PATHS.SEEDS_DASHBOARD);
            },
            linkText: strings.VIEW_FULL_DASHBOARD,
            value: numberFormatter.format(seedBankSummary?.value?.activeAccessions ?? 0),
          },
        ],
        title: strings.SEEDS,
      },
      {
        buttonProps: isAdmin(selectedOrganization)
          ? {
              label:
                selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
                  ? strings.ADD_INVENTORY
                  : strings.SET_UP_NURSERY,
              onClick: () =>
                selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
                  ? navigate(APP_PATHS.INVENTORY_NEW)
                  : navigate(APP_PATHS.NURSERIES_NEW),
            }
          : {
              label: strings.ADD_INVENTORY,
              onClick: () =>
                selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Nursery')
                  ? navigate(APP_PATHS.INVENTORY_NEW)
                  : navigate(APP_PATHS.INVENTORY),
            },
        icon: 'iconSeedling' as IconName,
        statsCardItems: [
          {
            label: strings.TOTAL_SEEDLINGS_COUNT,
            value: numberFormatter.format(orgNurserySummary?.value?.totalQuantity ?? 0),
          },
          {
            label: strings.TOTAL_WITHDRAWN_FOR_PLANTING,
            value: numberFormatter.format(orgNurserySummary?.value?.totalWithdrawn ?? 0),
            linkOnClick: () => {
              navigate(APP_PATHS.NURSERY_WITHDRAWALS);
            },
            linkText: strings.VIEW_PLANTING_PROGRESS,
          },
        ],
        title: strings.SEEDLINGS,
      },
    ];

    if (!plantingSiteSummaries?.length && isAdmin(selectedOrganization)) {
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
    goToNewAccession,
    navigate,
    numberFormatter,
    activeLocale,
    selectedOrganization,
    species.length,
    speciesLastModifiedDate,
    seedBankSummary,
    orgNurserySummary,
    plantingSiteSummaries,
  ]);

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
                {virtualWalkthroughEnabled && (
                  <Grid item xs={12}>
                    <VirtualWalkthroughMessages organizationId={selectedOrganization!.id} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <OrganizationStatsCard rows={organizationStatsCardRows} />
                </Grid>

                {virtualWalkthroughEnabled && (
                  <Grid item xs={12}>
                    <VirtualWalkthroughCard />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <MobileAppCard
                    description={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP_DESCRIPTION}
                    imageAlt={strings.TERRAWARE_MOBILE_APP_IMAGE_ALT}
                    imageSource='/assets/terraware-mobile-app.svg'
                    padding='32px'
                    title={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP}
                  />
                </Grid>
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
              </Grid>
            </Container>
          </Box>
        )}
      </Box>
    </TfMain>
  );
};

export default TerrawareHomeView;
