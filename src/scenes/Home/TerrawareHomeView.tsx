import React, { useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { ButtonType } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

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
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useOrganization, useUser } from 'src/providers';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

import NewApplicationModal from '../ApplicationRouter/NewApplicationModal';

type PageCardNextProps = {
  buttonLabel?: string;
  buttonType?: ButtonType;
  description: string | (string | JSX.Element)[];
  id?: string;
  imageSource?: string;
  onClickButton?: () => void;
  onClickSecondaryButton?: () => void;
  secondaryButtonLabel?: string;
  secondaryButtonType?: ButtonType;
  title?: string | (string | JSX.Element)[];
};

const PageCardNext = ({
  buttonLabel,
  buttonType = 'passive',
  description,
  id,
  imageSource,
  onClickButton,
  onClickSecondaryButton,
  secondaryButtonLabel,
  secondaryButtonType = 'passive',
  title,
}: PageCardNextProps): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <>
      <Box
        className={isMobile ? '' : 'min-height'}
        id={id ?? ''}
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBg,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        {imageSource && (
          <Box marginRight='32px'>
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
        <Box
          sx={{
            flexDirection: 'row',
            paddingLeft: '32px',
            whiteSpace: 'nowrap',
          }}
        >
          {buttonLabel && onClickButton && (
            <Button label={buttonLabel} onClick={onClickButton} priority='secondary' type={buttonType} />
          )}
          {secondaryButtonLabel && onClickSecondaryButton && (
            <Button
              label={secondaryButtonLabel}
              onClick={onClickSecondaryButton}
              priority='secondary'
              style={{ marginLeft: '19px' }}
              type={secondaryButtonType}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

const TerrawareHomeView = () => {
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isTablet, isMobile } = useDeviceInfo();
  const mixpanel = useMixpanel();

  const homePageOnboardingImprovementsEnabled = isEnabled('Home Page Onboarding Improvements');

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
        {homePageOnboardingImprovementsEnabled ? (
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
                  <PageCardNext
                    buttonLabel={strings.DOWNLOAD_FOR_ANDROID}
                    description={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP_DESCRIPTION}
                    id='mobileAppHomeCard'
                    imageSource='/assets/terraware-mobile-app.svg'
                    onClickButton={() => {
                      window.open(TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK, '_blank');
                    }}
                    onClickSecondaryButton={() => {
                      window.open(TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK, '_blank');
                    }}
                    secondaryButtonLabel={strings.DOWNLOAD_FOR_IOS}
                    title={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP}
                  />
                </Grid>

                <Grid item xs={12}>
                  <PageCardNext
                    buttonLabel={strings.APPLY}
                    buttonType='productive'
                    id='applicationHomeCard'
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
                    onClickButton={() => {
                      mixpanel?.track(MIXPANEL_EVENTS.HOME_ACCELERATOR_APPLY_BUTTON);
                      setIsNewApplicationModalOpen(true);
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
