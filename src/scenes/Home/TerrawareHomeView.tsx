import React, { useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useNavigate } from 'react-router-dom';

import { Box, Container, Grid, SxProps, Typography, useTheme } from '@mui/material';
import { Icon, IconName } from '@terraware/web-components';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import Link from 'src/components/common/Link';
import PageCard from 'src/components/common/PageCard';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import {
  ACCELERATOR_LINK,
  APP_PATHS,
  TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK,
  TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK,
} from 'src/constants';
import isEnabled from 'src/features';
import { useOrgNurserySummary } from 'src/hooks/useOrgNurserySummary';
import { useSeedBankSummary } from 'src/hooks/useSeedBankSummary';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import NewApplicationModal from 'src/scenes/ApplicationRouter/NewApplicationModal';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

type StatsCard = {
  label: string;
  linkOnClick?: () => void;
  linkText?: string;
  value?: string;
};

const StatsCard = ({ label, linkOnClick, linkText, value }: StatsCard) => {
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: isDesktop ? 'flex-start' : 'center',
        [isDesktop ? 'borderRight' : 'borderBottom']: `1px solid ${theme.palette.TwClrBaseGray100}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: '8px 0',
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: '24px',
          marginBottom: '8px',
        }}
        title={label}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          lineHeight: '32px',
          marginBottom: '8px',
        }}
        title={value}
      >
        {value || '-'}
      </Typography>
      <Box sx={{ minHeight: '24px' }}>{linkText && linkOnClick && <Link onClick={linkOnClick}>{linkText}</Link>}</Box>
    </Box>
  );
};

type PlantingSiteStatsCardItem = {
  buttonProps?: ButtonProps;
  icon: IconName;
  statsCards: StatsCard[];
  title: string;
};

type PlantingSiteStatsCardProps = {
  items: PlantingSiteStatsCardItem[];
};

const PlantingSiteStatsCard = ({ items }: PlantingSiteStatsCardProps): JSX.Element => {
  const { isDesktop, isMobile } = useDeviceInfo();
  const theme = useTheme();

  const primaryGridSize = () => {
    if (isDesktop) {
      return 3;
    }
    return 12;
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      {items.map((item, index) => (
        <Grid key={index} container spacing={3} sx={{ marginBottom: '16px', padding: 0 }}>
          <Grid item xs={primaryGridSize()}>
            <Box
              sx={{
                alignItems: 'center',
                background: theme.palette.TwClrBgSecondary,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                minHeight: '112px',
                padding: '8px',
              }}
            >
              <Icon
                name={item.icon}
                size='medium'
                style={{
                  fill: theme.palette.TwClrIcnSecondary,
                }}
              />
              <Typography
                sx={{
                  color: theme.palette.TwClrTxt,
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '24px',
                }}
              >
                {item.title}
              </Typography>
            </Box>
          </Grid>

          {(isDesktop || item.statsCards[0]) && (
            <Grid item xs={primaryGridSize()}>
              {item.statsCards[0] && <StatsCard {...item.statsCards[0]} />}
            </Grid>
          )}

          {(isDesktop || item.statsCards[1]) && (
            <Grid item xs={primaryGridSize()}>
              {item.statsCards[1] && <StatsCard {...item.statsCards[1]} />}
            </Grid>
          )}

          <Grid item xs={primaryGridSize()}>
            {item.buttonProps && (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  paddingBottom: isDesktop ? 0 : '24px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <Button
                  priority='secondary'
                  style={{
                    marginLeft: isMobile ? 0 : undefined,
                    width: isMobile ? '100%' : 'auto',
                  }}
                  type='productive'
                  {...item.buttonProps}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

type CTACardProps = {
  buttonsContainerSx?: SxProps;
  description: string | (string | JSX.Element)[];
  imageSource?: string;
  padding?: number | string;
  primaryButtonProps?: ButtonProps;
  secondaryButtonProps?: ButtonProps;
  title?: string | (string | JSX.Element)[];
};

const CTACard = ({
  buttonsContainerSx,
  description,
  imageSource,
  padding = '24px',
  primaryButtonProps,
  secondaryButtonProps,
  title,
}: CTACardProps): JSX.Element => {
  const { isDesktop, isMobile, isTablet } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {imageSource && (
          <Box
            sx={{
              marginBottom: isMobile ? '32px' : 0,
              marginRight: isMobile ? 0 : '32px',
              textAlign: 'center',
            }}
          >
            <img src={imageSource} />
          </Box>
        )}
        <Box>
          {title && (
            <Typography
              component='p'
              variant='h6'
              sx={{
                color: theme.palette.TwClrTxt,
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
              }}
            >
              {title}
            </Typography>
          )}
          <Typography
            component='p'
            variant='h6'
            sx={{
              color: theme.palette.TwClrTxt,
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            marginLeft: isDesktop ? '27px' : 0,
            marginTop: isMobile || isTablet ? '32px' : 0,
            whiteSpace: 'nowrap',
          },
          ...(Array.isArray(buttonsContainerSx) ? buttonsContainerSx : [buttonsContainerSx]),
        ]}
      >
        {primaryButtonProps && <Button priority='secondary' type='productive' {...primaryButtonProps} />}
        {secondaryButtonProps && (
          <Button
            priority='secondary'
            style={{
              marginLeft: isMobile ? 0 : '19px',
              marginTop: isMobile ? '19px' : 0,
            }}
            type='passive'
            {...secondaryButtonProps}
          />
        )}
      </Box>
    </Box>
  );
};

const TerrawareHomeView = () => {
  const { activeLocale } = useLocalization();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isTablet, isMobile } = useDeviceInfo();
  const mixpanel = useMixpanel();
  const navigate = useNavigate();
  const { availableSpecies } = useSpecies();
  const seedBankSummary = useSeedBankSummary();
  const orgNurserySummary = useOrgNurserySummary();
  const homePageOnboardingImprovementsEnabled = isEnabled('Home Page Onboarding Improvements');

  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState<boolean>(false);

  const isLoadingInitialData = useMemo(
    () =>
      availableSpecies === undefined ||
      orgNurserySummary?.requestSucceeded === undefined ||
      seedBankSummary?.requestSucceeded === undefined,
    [availableSpecies, orgNurserySummary, seedBankSummary]
  );

  const showHomePageOnboardingImprovements = useMemo(
    () =>
      homePageOnboardingImprovementsEnabled &&
      typeof availableSpecies?.length === 'number' &&
      availableSpecies?.length > 0,
    [availableSpecies, homePageOnboardingImprovementsEnabled]
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

  const plantingSiteStatsCardItems: PlantingSiteStatsCardItem[] = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        buttonProps: {
          label: strings.ADD_SPECIES,
          onClick: () => {
            navigate(APP_PATHS.SPECIES_NEW);
          },
        },
        icon: 'seeds',
        statsCards: [
          { label: strings.TOTAL_SPECIES, value: availableSpecies?.length.toString() },
          {
            label: strings.LAST_UPDATED,
            value: speciesLastModifiedDate,
          },
        ],
        title: strings.SPECIES,
      },
      {
        buttonProps: {
          label: strings.SET_UP_SEED_BANK,
          onClick: () => {
            navigate(APP_PATHS.SEED_BANKS_NEW);
          },
        },
        icon: 'seeds',
        statsCards: [
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
        buttonProps: {
          label: strings.SET_UP_NURSERY,
          onClick: () => {
            navigate(APP_PATHS.NURSERIES_NEW);
          },
        },
        icon: 'iconSeedling',
        statsCards: [
          { label: strings.TOTAL_SEEDLINGS_COUNT, value: orgNurserySummary?.totalQuantity?.toString() },
          { label: strings.TOTAL_SEEDLINGS_SENT, value: orgNurserySummary?.totalWithdrawn?.toString() },
        ],
        title: strings.SEEDLINGS,
      },
      {
        buttonProps: {
          label: strings.ADD_PLANTING_SITE,
          onClick: () => {
            navigate(APP_PATHS.PLANTING_SITES_NEW);
          },
        },
        icon: 'iconRestorationSite',
        statsCards: [],
        title: strings.PLANTS,
      },
    ];
  }, [activeLocale, availableSpecies, orgNurserySummary, seedBankSummary, speciesLastModifiedDate]);

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
                  <PlantingSiteStatsCard items={plantingSiteStatsCardItems} />
                </Grid>

                <Grid item xs={12}>
                  <CTACard
                    description={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP_DESCRIPTION}
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
                      label: strings.APPLY,
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
        ) : (
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
                {isAdmin(selectedOrganization) && (
                  <Grid item xs={secondaryGridSize()}>
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
