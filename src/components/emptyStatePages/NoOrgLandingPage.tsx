import React, { useState } from 'react';
import AddNewOrganizationModal from 'src/components/AddNewOrganizationModal';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import landingPageStrings from 'src/strings/noOrgLandingPage';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { Container, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import AppVersionBar from 'src/components/AppVersionBar';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    paddingTop: '64px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  appVersionContainer: {
    width: '100%',
  },
  mainContainer: {
    maxWidth: '1500px',
    margin: 'auto',
    marginTop: `max(40px, calc(50% - 1500px/2))`,
  },
}));

const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '28px',
  titleLineHeight: '36px',
  subtitleFontSize: '20px',
  subtitleLineHeight: '28px',
  listContainerVerticalMargin: '48px',
};

const LIST_ITEM_CONTENT: ListItemContent[] = [
  { icon: 'organization', title: strings.ORGANIZATION, description: landingPageStrings.DESCRIPTION_ORGANIZATION },
  { icon: 'people', title: strings.PEOPLE, description: landingPageStrings.DESCRIPTION_PEOPLE },
  { icon: 'species2', title: strings.SPECIES, description: landingPageStrings.DESCRIPTION_SPECIES },
];

type LandingPageProps = {
  reloadOrganizationData: (selectedOrgId?: number) => void;
};

export default function NoOrgLandingPage(props: LandingPageProps): JSX.Element {
  const classes = useStyles();
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);

  return (
    <main className={classes.main}>
      <div className={classes.appVersionContainer}>
        <AppVersionBar />
      </div>
      <Container className={classes.mainContainer}>
        <AddNewOrganizationModal
          open={isOrgModalOpen}
          onCancel={() => setIsOrgModalOpen(false)}
          reloadOrganizationData={props.reloadOrganizationData}
        />
        <EmptyStateContent
          title={landingPageStrings.TITLE_WELCOME}
          subtitle={landingPageStrings.SUBTITLE_GET_STARTED}
          listItems={LIST_ITEM_CONTENT}
          buttonText={dictionary.CREATE_ORGANIZATION}
          onClickButton={() => setIsOrgModalOpen(true)}
          footnote={[
            landingPageStrings.FOOTNOTE_WAIT_FOR_INVITATION_1,
            landingPageStrings.FOOTNOTE_WAIT_FOR_INVITATION_2,
          ]}
          styles={EMPTY_STATE_CONTENT_STYLES}
        />
      </Container>
    </main>
  );
}
