import React, { type JSX, useCallback, useState } from 'react';

import { Box, Container, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import AddNewOrganizationModal from 'src/components/AddNewOrganizationModal';
import PageSnackbar from 'src/components/PageSnackbar';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import useCreateApplication from 'src/hooks/useCreateApplication';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '28px',
  titleLineHeight: '36px',
  subtitleFontSize: '20px',
  subtitleLineHeight: '28px',
  listContainerVerticalMargin: '48px',
};

export default function NoOrgApplicationLandingPage(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const activeLocale = useLocalization();
  const theme = useTheme();
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);
  const { goToApplication } = useNavigateTo();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toastError, toastSuccess } = useSnackbar();
  const { createWithNewProject } = useCreateApplication();

  const { reloadOrganizations } = useOrganization();

  const onOrgCreated = useCallback(
    (organization: Organization) => {
      setIsLoading(true);
      void createWithNewProject(organization.name, organization.id)
        .then((applicationId) => {
          if (activeLocale) {
            toastSuccess(strings.SUCCESS);
          }
          goToApplication(applicationId);
          void reloadOrganizations();
        })
        .catch(() => {
          setIsLoading(false);
          toastError();
        });
    },
    [activeLocale, createWithNewProject, goToApplication, reloadOrganizations, toastError, toastSuccess]
  );

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
          borderRadius: '24px',
          margin: '0 auto',
          maxWidth: '900px',
          padding: isMobile ? '24px 26px' : '40px 26px',
        }}
      >
        <PageSnackbar />
        <AddNewOrganizationModal
          isApplication
          open={isOrgModalOpen}
          onCancel={() => setIsOrgModalOpen(false)}
          onSuccess={(organization: Organization) => onOrgCreated(organization)}
        />
        {isLoading && <BusySpinner />}
        <EmptyStateContent
          title={strings.TITLE_WELCOME}
          subtitle={strings.SUBTITLE_APPLICATION_GET_STARTED}
          buttonText={strings.CREATE_ORGANIZATION}
          onClickButton={() => setIsOrgModalOpen(true)}
          footnote={[strings.FOOTNOTE_WAIT_FOR_INVITATION_1, strings.FOOTNOTE_WAIT_FOR_INVITATION_2]}
          styles={EMPTY_STATE_CONTENT_STYLES}
        />
      </Container>
    </Box>
  );
}
