import React, { type JSX, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import AddNewOrganizationModal from 'src/components/AddNewOrganizationModal';
import PageSnackbar from 'src/components/PageSnackbar';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
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
  const { redirectAndNotify, reloadOrganizations } = useOrganization();

  const listItemContents: ListItemContent[] = [{ icon: 'newOrganization' }];

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
      <Box
        sx={{
          background: theme.palette.TwClrBg,
          borderRadius: '8px',
          margin: '0 auto',
          maxWidth: '900px',
          padding: isMobile ? '24px 26px' : '40px 26px',
          boxShadow: '0px 4px 8px #3A444533',
        }}
      >
        <PageSnackbar />
        <AddNewOrganizationModal
          open={isOrgModalOpen}
          onCancel={() => setIsOrgModalOpen(false)}
          onSuccess={(organization: Organization) => {
            void reloadOrganizations();
            redirectAndNotify(organization);
          }}
        />
        <EmptyStateContent
          title={strings.TITLE_WELCOME_EXCLAIM}
          subtitle={strings.SUBTITLE_GET_STARTED}
          listItems={listItemContents}
          buttonText={strings.CREATE_ORGANIZATION}
          onClickButton={() => setIsOrgModalOpen(true)}
          footnote={[strings.FOOTNOTE_WAIT_FOR_INVITATION_1, strings.FOOTNOTE_WAIT_FOR_INVITATION_2]}
          styles={EMPTY_STATE_CONTENT_STYLES}
        />
      </Box>
    </Box>
  );
}
