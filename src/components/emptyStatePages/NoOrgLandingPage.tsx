import React, { useState } from 'react';

import { Box, Container, useTheme } from '@mui/material';

import AddNewOrganizationModal from 'src/components/AddNewOrganizationModal';
import PageSnackbar from 'src/components/PageSnackbar';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '28px',
  titleLineHeight: '36px',
  subtitleFontSize: '20px',
  subtitleLineHeight: '28px',
  listContainerVerticalMargin: '48px',
};

export default function NoOrgLandingPage(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);
  const { redirectAndNotify } = useOrganization();
  const homePageOnboardingImprovementsEnabled = isEnabled('Home Page Onboarding Improvements');

  const listItemContents: ListItemContent[] = homePageOnboardingImprovementsEnabled
    ? [{ icon: 'organization' }]
    : [
        { icon: 'organization', title: strings.ORGANIZATION, description: strings.DESCRIPTION_ORGANIZATION },
        { icon: 'people', title: strings.PEOPLE, description: strings.DESCRIPTION_PEOPLE },
        { icon: 'species2', title: strings.SPECIES, description: strings.DESCRIPTION_SPECIES },
      ];

  return (
    <Box
      component='main'
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 88px)',
        padding: '115px 24px 24px',
      }}
    >
      <Container
        sx={{
          background: theme.palette.TwClrBg,
          borderRadius: homePageOnboardingImprovementsEnabled ? '8px' : '24px',
          margin: '0 auto',
          maxWidth: '900px',
          padding: isMobile ? '24px 26px' : '40px 26px',
          boxShadow: homePageOnboardingImprovementsEnabled ? '0px 4px 8px 0px #3A444533' : 'none',
        }}
      >
        <PageSnackbar />
        <AddNewOrganizationModal
          open={isOrgModalOpen}
          onCancel={() => setIsOrgModalOpen(false)}
          onSuccess={(organization: Organization) => redirectAndNotify(organization)}
        />
        <EmptyStateContent
          title={strings.TITLE_WELCOME_EXCLAM}
          subtitle={strings.SUBTITLE_GET_STARTED}
          listItems={listItemContents}
          buttonText={strings.CREATE_ORGANIZATION}
          onClickButton={() => setIsOrgModalOpen(true)}
          footnote={[strings.FOOTNOTE_WAIT_FOR_INVITATION_1, strings.FOOTNOTE_WAIT_FOR_INVITATION_2]}
          styles={EMPTY_STATE_CONTENT_STYLES}
        />
      </Container>
    </Box>
  );
}
